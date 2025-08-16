// controllers/statistics.controller.js
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getProductStatistics = async (req, res) => {
    try {
        const {
            sortBy = 'sold',
            order = 'desc',
            status,
            from,
            to,
            limit = 10,
            lowStockThreshold = 10
        } = req.query;

        // ===== 1. Lấy số liệu tổng =====
        const totalProducts = await Product.countDocuments();

        // 2. Tổng tồn kho (cộng tất cả quantity trong variations)
        const stockData = await Product.aggregate([
            { $unwind: "$variations" },
            { $group: { _id: null, totalStock: { $sum: "$variations.quantity" } } }
        ]);
        const totalStock = stockData.length > 0 ? stockData[0].totalStock : 0;

        // 3. Số sản phẩm sắp hết hàng (ít nhất một biến thể có số lượng < threshold)
        const lowStockCount = await Product.countDocuments({
            "variations.quantity": { $lt: parseInt(lowStockThreshold) }
        });
        // 4. Số sản phẩm đã hết hàng
        const outOfStockCount = await Product.countDocuments({
            status: "Hết hàng"
        });
        // ===== 2. Thống kê sản phẩm bán chạy =====
        const validStatuses = ['confirmed', 'processing', 'shipping', 'delivered'];
        const matchOrder = { status: { $in: validStatuses } };

        if (from || to) {
            matchOrder.createdAt = {};
            if (from) matchOrder.createdAt.$gte = new Date(from);
            if (to) matchOrder.createdAt.$lte = new Date(to);
        }

        const pipeline = [
            { $match: matchOrder },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product_id',
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ];

        if (status) {
            pipeline.push({
                $match: { 'product.status': status }
            });
        }

        pipeline.push({
            $addFields: {
                stock: '$product.quantity',
                name: '$product.name',
                image: '$product.image',
                category: '$product.category',
                status: '$product.status'
            }
        });

        let sortField = {};
        switch (sortBy) {
            case 'sold':
                sortField = { totalSold: order === 'asc' ? 1 : -1 };
                break;
            case 'revenue':
                sortField = { totalRevenue: order === 'asc' ? 1 : -1 };
                break;
            case 'stock':
                sortField = { stock: order === 'asc' ? 1 : -1 };
                break;
            case 'name':
                sortField = { name: order === 'asc' ? 1 : -1 };
                break;
            default:
                sortField = { totalSold: -1 };
        }
        pipeline.push({ $sort: sortField });
        pipeline.push({ $limit: parseInt(limit) });

        const topProducts = await Order.aggregate(pipeline);

        // ===== 3. Trả kết quả =====
        res.json({
            summary: {
                totalProducts,
                totalStock,
                lowStockCount,
                outOfSStockCount,
            },
            topProducts
        });

    } catch (err) {
        console.error('Lỗi khi thống kê sản phẩm:', err);
        res.status(500).json({ message: 'Không thể thống kê sản phẩm.' });
    }
};

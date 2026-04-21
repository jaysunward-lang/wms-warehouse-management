-- 创建物料库存表
CREATE TABLE IF NOT EXISTS material_stock (
    stock_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    material_id BIGINT UNSIGNED NOT NULL COMMENT '物料ID',
    quantity DECIMAL(15, 3) DEFAULT 0 COMMENT '当前库存数量',
    location VARCHAR(100) COMMENT '存放位置',
    warehouse_zone VARCHAR(50) COMMENT '仓库区域',
    shelf_no VARCHAR(50) COMMENT '货架编号',
    min_stock DECIMAL(15, 3) DEFAULT 0 COMMENT '最低库存预警',
    max_stock DECIMAL(15, 3) DEFAULT 999999 COMMENT '最高库存限制',
    locked_quantity DECIMAL(15, 3) DEFAULT 0 COMMENT '锁定数量(待出库)',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE,
    UNIQUE KEY uk_material_location (material_id, location),
    INDEX idx_location (location),
    INDEX idx_warehouse_zone (warehouse_zone),
    INDEX idx_quantity (quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料库存表';

-- 插入示例库存数据
INSERT INTO material_stock (material_id, quantity, location, warehouse_zone, shelf_no, min_stock, max_stock) VALUES
(1, 5000, 'A-01-01', 'A区', '01', 1000, 10000),
(2, 3000, 'A-01-02', 'A区', '01', 500, 5000),
(3, 2000, 'A-01-03', 'A区', '01', 300, 3000),
(4, 50, 'B-02-01', 'B区', '02', 10, 100),
(5, 30, 'B-02-02', 'B区', '02', 5, 50);

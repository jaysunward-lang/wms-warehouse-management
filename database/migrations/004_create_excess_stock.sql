-- 创建多余库存表
CREATE TABLE IF NOT EXISTS excess_stock (
    excess_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    material_id BIGINT UNSIGNED NOT NULL COMMENT '关联物料ID',
    quantity DECIMAL(15, 3) DEFAULT 0 COMMENT '多余库存数量',
    location VARCHAR(100) COMMENT '存放位置',
    reason VARCHAR(500) COMMENT '产生原因',
    status ENUM('pending', 'stored', 'cleared') DEFAULT 'pending' COMMENT '状态: pending待处理 stored已入库 cleared已清理',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    INDEX idx_material_id (material_id),
    INDEX idx_status (status),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多余库存表';

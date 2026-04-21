-- 创建出库记录表
CREATE TABLE IF NOT EXISTS outbound_records (
    outbound_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '出库单号',
    material_id BIGINT UNSIGNED NOT NULL COMMENT '物料ID',
    type ENUM('sale', 'use', 'transfer', 'scrap', 'excess', 'other') DEFAULT 'use' COMMENT '出库类型',
    quantity DECIMAL(15, 3) NOT NULL COMMENT '出库数量',
    batch_no VARCHAR(50) COMMENT '批次号',
    destination VARCHAR(200) COMMENT '去向/用途',
    location VARCHAR(100) COMMENT '出库位置',
    operator_id BIGINT UNSIGNED NOT NULL COMMENT '操作员ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作员名字',
    reason TEXT COMMENT '出库原因',
    remark TEXT COMMENT '备注',
    document_url VARCHAR(500) COMMENT '附件URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    FOREIGN KEY (operator_id) REFERENCES users(user_id),
    INDEX idx_record_no (record_no),
    INDEX idx_material_id (material_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库记录表';

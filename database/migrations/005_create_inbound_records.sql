-- 创建入库记录表
CREATE TABLE IF NOT EXISTS inbound_records (
    inbound_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '入库单号',
    material_id BIGINT UNSIGNED NOT NULL COMMENT '物料ID',
    type ENUM('purchase', 'return', 'transfer', 'excess', 'other') DEFAULT 'purchase' COMMENT '入库类型',
    quantity DECIMAL(15, 3) NOT NULL COMMENT '入库数量',
    batch_no VARCHAR(50) COMMENT '批次号',
    source VARCHAR(200) COMMENT '来源/供应商',
    location VARCHAR(100) COMMENT '入库位置',
    operator_id BIGINT UNSIGNED NOT NULL COMMENT '操作员ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作员名字',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库记录表';

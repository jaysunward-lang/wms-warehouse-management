-- 创建上下架记录表
CREATE TABLE IF NOT EXISTS shelf_records (
    record_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '记录单号',
    material_id BIGINT UNSIGNED NOT NULL COMMENT '物料ID',
    action ENUM('up', 'down', 'transfer', 'adjust') NOT NULL COMMENT '操作:上架/下架/移库/盘点调整',
    quantity DECIMAL(15, 3) NOT NULL COMMENT '数量',
    from_location VARCHAR(100) COMMENT '原位置',
    to_location VARCHAR(100) COMMENT '目标位置',
    operator_id BIGINT UNSIGNED NOT NULL COMMENT '操作员ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作员名字',
    related_type ENUM('inbound', 'outbound', 'adjust') COMMENT '关联类型',
    related_id BIGINT UNSIGNED COMMENT '关联记录ID',
    reason VARCHAR(500) COMMENT '操作原因',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    FOREIGN KEY (operator_id) REFERENCES users(user_id),
    INDEX idx_record_no (record_no),
    INDEX idx_material_id (material_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    INDEX idx_operator (operator_id),
    INDEX idx_related (related_type, related_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='上下架记录表';

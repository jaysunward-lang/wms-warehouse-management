-- 创建物料基础表
CREATE TABLE IF NOT EXISTS materials (
    material_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
    material_name VARCHAR(200) NOT NULL COMMENT '物料名称',
    category VARCHAR(50) COMMENT '物料类别',
    spec VARCHAR(200) COMMENT '规格型号',
    unit VARCHAR(20) DEFAULT '件' COMMENT '计量单位',
    barcode VARCHAR(100) COMMENT '条形码',
    description TEXT COMMENT '物料描述',
    status TINYINT DEFAULT 1 COMMENT '状态: 1启用 0禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_material_code (material_code),
    INDEX idx_category (category),
    INDEX idx_barcode (barcode),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料基础信息表';

-- 插入示例物料数据
INSERT INTO materials (material_code, material_name, category, spec, unit, barcode) VALUES
('MAT001', '螺丝钉 M4x20', '原材料', 'M4x20 不锈钢', '个', '6901234567890'),
('MAT002', '螺母 M4', '原材料', 'M4 不锈钢', '个', '6901234567891'),
('MAT003', '垫片 M4', '原材料', 'M4 不锈钢', '个', '6901234567892'),
('MAT004', '电机 220V', '半成品', '220V 50W', '台', '6901234567893'),
('MAT005', '控制器主板', '成品', 'V2.0', '块', '6901234567894');

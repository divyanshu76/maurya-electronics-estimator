const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/components/icons/MaterialIcons.tsx',
  'src/components/layout/AppLayout.tsx',
  'src/pages/admin/AdminCategoriesPage.tsx',
  'src/pages/admin/AdminMaterialsPage.tsx',
  'src/pages/admin/AdminPage.tsx',
  'src/pages/admin/AdminSettingsPage.tsx',
  'src/pages/EstimateDetailPage.tsx',
  'src/pages/EstimatorPage.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/SavedEstimatesPage.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Remove import React from "react";
  content = content.replace(/import React from ["']react["'];\r?\n/g, '');
  content = content.replace(/import React, \{/g, 'import {');
  
  // Specific fixes
  if (f.includes('MaterialIcons.tsx')) {
    content = content.replace(/type IconComponent = [^;]+;/g, '');
  }
  if (f.includes('AppLayout.tsx')) {
    content = content.replace(/const navigate = useNavigate\(\);\r?\n/g, '');
  }
  if (f.includes('AdminCategoriesPage.tsx')) {
    content = content.replace(/\bTag,\s*/g, '');
  }
  if (f.includes('AdminMaterialsPage.tsx')) {
    content = content.replace(/\bDivider,\s*/g, '');
    content = content.replace(/\bCard,\s*/g, '');
    content = content.replace(/const \[varForm\] = Form\.useForm\(\);\r?\n/g, '');
  }
  if (f.includes('AdminPage.tsx')) {
    content = content.replace(/\bModal,\s*/g, '');
    content = content.replace(/\bSettingOutlined,\s*/g, '');
  }
  if (f.includes('EstimateDetailPage.tsx')) {
    content = content.replace(/\bTag,\s*/g, '');
  }
  if (f.includes('EstimatorPage.tsx')) {
    content = content.replace(/\bEmpty,\s*/g, '');
    content = content.replace(/\bDivider,\s*/g, '');
    content = content.replace(/\bCategory,\s*/g, '');
    content = content.replace(/const \[isLoading, setIsLoading\] = useState\(false\);\r?\n/g, '');
    content = content.replace(/\(item, idx\)/g, '(item, _idx)');
  }
  if (f.includes('SavedEstimatesPage.tsx')) {
    content = content.replace(/\bEmpty,\s*/g, '');
  }

  fs.writeFileSync(f, content);
});

import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Sample data for the Excel file
const sampleData = [
    {
        'Date': '2026-01-24',
        'Branch': 'Dark Store',
        'Channel': 'Talabat',
        'Sales': 45000,
        'Orders': 120,
        'Target': 50000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Dark Store',
        'Channel': 'Instashop',
        'Sales': 30000,
        'Orders': 80,
        'Target': 40000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Dark Store',
        'Channel': 'Call Center',
        'Sales': 15000,
        'Orders': 45,
        'Target': 25000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Dark Store',
        'Channel': 'Website & App',
        'Sales': 20000,
        'Orders': 60,
        'Target': 30000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Maadi',
        'Channel': 'Talabat',
        'Sales': 35000,
        'Orders': 95,
        'Target': 45000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Maadi',
        'Channel': 'Instashop',
        'Sales': 25000,
        'Orders': 70,
        'Target': 35000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Maadi',
        'Channel': 'Call Center',
        'Sales': 18000,
        'Orders': 50,
        'Target': 28000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Maadi',
        'Channel': 'Website & App',
        'Sales': 22000,
        'Orders': 65,
        'Target': 32000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Masr El Gededa',
        'Channel': 'Talabat',
        'Sales': 40000,
        'Orders': 110,
        'Target': 48000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Masr El Gededa',
        'Channel': 'Instashop',
        'Sales': 28000,
        'Orders': 75,
        'Target': 38000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Masr El Gededa',
        'Channel': 'Call Center',
        'Sales': 16000,
        'Orders': 48,
        'Target': 26000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Masr El Gededa',
        'Channel': 'Website & App',
        'Sales': 24000,
        'Orders': 68,
        'Target': 34000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Tagamo3',
        'Channel': 'Talabat',
        'Sales': 32000,
        'Orders': 88,
        'Target': 42000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Tagamo3',
        'Channel': 'Instashop',
        'Sales': 23000,
        'Orders': 65,
        'Target': 33000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Tagamo3',
        'Channel': 'Call Center',
        'Sales': 14000,
        'Orders': 42,
        'Target': 24000
    },
    {
        'Date': '2026-01-24',
        'Branch': 'Tagamo3',
        'Channel': 'Website & App',
        'Sales': 19000,
        'Orders': 58,
        'Target': 29000
    },
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths
ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 18 }, // Branch
    { wch: 18 }, // Channel
    { wch: 12 }, // Sales
    { wch: 10 }, // Orders
    { wch: 12 }, // Target
];

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

// Write the Excel file
const filePath = 'C:/Users/pc/.gemini/antigravity/brain/62d18365-cd31-4383-83a7-16c5b689df8f/CStore_Sample_Data.xlsx';
XLSX.writeFile(wb, filePath);

console.log('Excel file created successfully at:', filePath);

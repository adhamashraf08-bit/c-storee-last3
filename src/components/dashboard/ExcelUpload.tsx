import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SalesRecord, BRANCHES, CHANNELS } from '@/types/sales';
import * as XLSX from 'xlsx';
import { useLanguage } from '../LanguageProvider';
import { translations } from '@/utils/translations';

interface ExcelUploadProps {
  onUpload: (records: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>[]) => Promise<boolean>;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function ExcelUpload({ onUpload }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState(0);
  const { t, isRtl } = useLanguage();

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\s_-]+/g, '') // Remove all spaces and symbols for matching
      .trim();
  };

  const parseNumeric = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    return Number(clean) || 0;
  };

  const findClosestMatch = (input: string, options: readonly string[]): string | null => {
    const normalizedInput = normalizeString(input);

    // First try exact or normalized match with English names
    for (const option of options) {
      if (normalizeString(option) === normalizedInput) {
        return option;
      }
    }

    // Then try matching with Arabic translations
    const arTranslations = translations.ar as any;
    for (const option of options) {
      const arName = arTranslations[option];
      if (arName && normalizeString(arName) === normalizedInput) {
        return option;
      }
    }

    // Fuzzy match (substring)
    for (const option of options) {
      const arName = arTranslations[option];
      if (normalizedInput.includes(normalizeString(option)) ||
        normalizeString(option).includes(normalizedInput) ||
        (arName && (normalizedInput.includes(normalizeString(arName)) ||
          normalizeString(arName).includes(normalizedInput)))) {
        return option;
      }
    }

    return null;
  };

  const parseExcel = useCallback(async (file: File): Promise<Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const records: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>[] = [];

          for (const row of jsonData as Record<string, unknown>[]) {
            const keys = Object.keys(row);
            const normalizedKeys = keys.map(k => normalizeString(k));

            const findKey = (searchTerms: string[]) => {
              const index = normalizedKeys.findIndex(nk =>
                searchTerms.some(term => nk.includes(normalizeString(term)))
              );
              return index !== -1 ? keys[index] : null;
            };

            const dateKey = findKey(['date', 'تاريخ']);
            const branchKey = findKey(['branch', 'فرع']);
            const channelKey = findKey(['channel', 'قناة']);
            const salesKey = findKey(['sales', 'مبيعات', 'value', 'قيمة']);
            const ordersKey = findKey(['order', 'طلب', 'عدد']);
            const targetKey = findKey(['target', 'هدف', 'مستهدف']);

            if (!dateKey || !branchKey || !channelKey) {
              console.warn('Skipping row due to missing required keys:', { dateKey, branchKey, channelKey }, row);
              continue;
            }

            const dateValue = row[dateKey];
            let dateStr: string | null = null;

            if (dateValue instanceof Date) {
              dateStr = dateValue.toISOString().split('T')[0];
            } else if (typeof dateValue === 'number') {
              const excelDate = XLSX.SSF.parse_date_code(dateValue);
              dateStr = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
            } else if (typeof dateValue === 'string') {
              // Handle various date formats including DD/MM/YYYY
              const parts = dateValue.split(/[\/\-\.]/);
              if (parts.length === 3) {
                // If it looks like DD/MM/YYYY or YYYY/MM/DD
                if (parts[0].length === 4) { // YYYY/MM/DD
                  dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                } else if (parts[2].length === 4) { // DD/MM/YYYY
                  dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
              }

              if (!dateStr) {
                const d = new Date(dateValue);
                if (!isNaN(d.getTime())) {
                  dateStr = d.toISOString().split('T')[0];
                } else {
                  dateStr = dateValue; // Fallback
                }
              }
            } else {
              dateStr = String(dateValue);
            }

            if (!dateStr || dateStr === 'null' || dateStr === 'undefined') continue;

            const branchName = findClosestMatch(String(row[branchKey]), BRANCHES);
            const channelName = findClosestMatch(String(row[channelKey]), CHANNELS);

            if (!branchName || !channelName) continue;

            records.push({
              date: dateStr,
              branch_name: branchName,
              channel_name: channelName,
              sales_value: salesKey ? parseNumeric(row[salesKey]) : 0,
              orders_count: ordersKey ? parseNumeric(row[ordersKey]) : 0,
              target_value: targetKey ? parseNumeric(row[targetKey]) : 0,
            });
          }

          if (records.length === 0) {
            console.error('No valid records found in file. Row data preview:', jsonData.slice(0, 5));
            reject(new Error('No valid records found. Check console for details.'));
          } else {
            console.log('Parsed Record Preview (First 3):', records.slice(0, 3));
            resolve(records);
          }
        } catch (err) {
          reject(new Error('Failed to parse Excel file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setStatus('error');
      setErrorMessage('Please upload an Excel file');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setErrorMessage(null);

    try {
      const records = await parseExcel(file);
      setRecordCount(records.length);
      const success = await onUpload(records);
      if (success) setStatus('success');
      else {
        setStatus('error');
        setErrorMessage('Upload failed');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [parseExcel, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="kpi-card animate-fade-in group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{t('data_upload')}</h3>
          <p className="text-sm text-muted-foreground">{t('upload_desc')}</p>
        </div>
      </div>

      <div
        className={cn(
          'upload-zone text-center',
          isDragging && 'dragging',
          status === 'success' && 'border-green-500 bg-green-500/5',
          status === 'error' && 'border-destructive bg-destructive/5'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {status === 'idle' && (
          <>
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              {t('drop_file')}
            </p>
            <label>
              <input type="file" accept=".xlsx,.xls" onChange={handleFileInput} className="hidden" />
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </>
        )}

        {status === 'uploading' && (
          <div className="py-4">
            <Loader2 className="h-10 w-10 mx-auto text-accent animate-spin mb-3" />
            <p className="text-sm font-medium">Processing...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 text-center">
            <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-3" />
            <p className="text-sm font-medium text-green-600">
              {recordCount} Records Uploaded!
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setStatus('idle')}>
              Upload Another
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setStatus('idle')}>
              {t('cancel')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

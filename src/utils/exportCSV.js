import React from 'react'
import Button from 'react-bootstrap/Button';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'

export const ExportCSV = ({csvData, fileName}) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const exportToCSV = (csvData, fileName) => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    };

    const onExport = () => {
        Swal.fire({
            title: '確認匯出的檔案名稱！',
            input: 'text',
            inputValue: fileName,
            inputAttributes: {
                autocapitalize: 'off',
            },
            showCancelButton: true,
            confirmButtonText: '匯出！',
            showLoaderOnConfirm: true,
            cancelButtonText: '取消',
            preConfirm: (newFileName) => {
                exportToCSV(csvData, newFileName);
            }
        })
    };

    return (
        <Button variant="warning" onClick={(e) => onExport()}>匯出學生名單</Button>
    )
};
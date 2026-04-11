import { Table } from "antd";

function CustomTable({ data, columns, pageSize }) {
    return(
        <Table dataSource={data} columns={columns} className="w-full" pagination={{pageSize: pageSize || 10}}/>
    )
}






export default CustomTable;
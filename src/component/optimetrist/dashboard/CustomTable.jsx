import { Table } from "antd";

function CustomTable({ data, columns }) {
    return(
        <Table dataSource={data} columns={columns} className="w-full" pagination={{pageSize:10}}/>
    )
}






export default CustomTable;
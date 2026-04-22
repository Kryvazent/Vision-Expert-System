import { Table } from "antd";

function CustomTable({ data, columns, pageSize,className, y }) {
    return(
        <Table scroll={{ y: y || 460 }} dataSource={data} columns={columns} className={className || "w-full"} pagination={{pageSize: pageSize || 10}}/>
    )
}






export default CustomTable;
import { Card, DatePicker, Select } from "antd";

import { useState } from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_BRANCHES = gql`
  query {

    branchCollection {
      edges {
        node {
          branch_name
        }
      }
    }

  }
`;

const GET_DAILY_SALES = gql`
  query GetDailySales {

    orderCollection {
      edges {
        node {

          id

          placed_at

          advance

          total_payment

          clinic_attend_customer {

            customer_has_branch {

              branch {
                branch_name
              }

            }
          }

        }
      }
    }

  }
`;

export default function DailySales() {

  // selected date
  const [selectedDate, setSelectedDate] =
    useState(null);

  // selected branch
  const [selectedBranch, setSelectedBranch] =
    useState("all");

  // branch data
  const {
    data: branchData
  } = useQuery(GET_BRANCHES);

  // sales data
  const {
    data,
    loading,
    error
  } = useQuery(GET_DAILY_SALES);

  // filter orders
  const filteredOrders =
    data?.orderCollection?.edges?.filter((item) => {

      // branch name
      const branchName =
        item?.node?.clinic_attend_customer
          ?.customer_has_branch
          ?.branch
          ?.branch_name;

      // order date
      const orderDate =
        item?.node?.placed_at?.split("T")[0];

      // branch filter
      const branchMatch =
        selectedBranch === "all"
          ? true
          : branchName === selectedBranch;

      // date filter
      const dateMatch =
        selectedDate
          ? orderDate === selectedDate
          : true;

      return branchMatch && dateMatch;

    }) || [];

  // grand total
  const grandTotal =
    filteredOrders.reduce(
      (sum, item) =>
        sum + (item?.node?.advance || 0),
      0
    );

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      {/* Filter Card */}
      <Card className="rounded-xl">

        {/* Flex Row */}
        <div className="flex flex-wrap gap-6">

          {/* Date */}
          <div className="flex-1 min-w-[250px] space-y-2">

            <p className="font-medium">
              Select Date
            </p>

            <DatePicker
              className="w-full"

              onChange={(date, dateString) => {

                setSelectedDate(dateString);

              }}
            />

          </div>

          {/* Branch */}
          <div className="flex-1 min-w-[250px] space-y-2">

            <p className="font-medium">
              Filter by Branch
            </p>

            <Select
              className="w-full"

              placeholder="All Branches"

              defaultValue="all"

              onChange={(value) => {

                setSelectedBranch(value);

              }}

              options={[

                {
                  value: "all",
                  label: "All Branches",
                },

                ...(branchData?.branchCollection?.edges?.map((b) => ({

                  value: b?.node?.branch_name,

                  label: b?.node?.branch_name,

                })) || [])

              ]}
            />

          </div>

        </div>

        {/* Daily Orders */}
        <div className="mt-6 space-y-4">

          {loading && (
            <p>Loading...</p>
          )}

          {error && (
            <p>Error loading data</p>
          )}

          {!loading &&
            filteredOrders.length === 0 && (
              <p>No sales found</p>
            )}

          {filteredOrders.map((item) => (

            <div
              key={item?.node?.id}
              className="border rounded-xl p-4 flex justify-between items-center"
            >

              <div>

                <p className="font-semibold">

                  Order ID:
                  {" "}
                  OD{item?.node?.id}

                </p>

                <p className="text-gray-500">

                  Branch:
                  {" "}

                  {
                    item?.node
                      ?.clinic_attend_customer
                      ?.customer_has_branch
                      ?.branch
                      ?.branch_name
                  }

                </p>

              </div>

              <div className="text-right">

                <p className="text-green-600 font-bold text-lg">

                  LKR{" "}

                  {
                    item?.node?.advance
                      ?.toLocaleString()
                  }

                </p>

              </div>

            </div>
          ))}

        </div>

        {/* Grand Total Box */}
        <div className="mt-6 bg-blue-100 p-6 rounded-xl flex justify-end text-lg font-semibold">

          Grand Total:

          <span className="text-green-600 ml-2">

            LKR {grandTotal.toLocaleString()}

          </span>

        </div>

      </Card>

    </div>
  );
}
import { useState } from "react";
import { Card, Select } from "antd";

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

const GET_RECOVERY_DETAILS = gql`
  query GetRecoveryDetails {

    orderCollection {
      edges {
        node {

          id

          venue

          estimated_delivery

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

export default function RecoveryDetails() {

  // selected branch
  const [selectedBranch, setSelectedBranch] =
    useState("All");

  // branch data
  const {
    data: branchData
  } = useQuery(GET_BRANCHES);

  // recovery data
  const {
    data,
    loading,
    error
  } = useQuery(GET_RECOVERY_DETAILS);

  // current date
  const today = new Date();

  // convert backend data
  const recoveryData =
    data?.orderCollection?.edges

      // extra recovery filter
      ?.filter((item) => {

        const order = item?.node;

        // delivery date
        const deliveryDate =
          new Date(order?.estimated_delivery);

        // remaining payment
        const hasRemaining =
          order?.advance !== order?.total_payment;

        // delivery already passed
        const datePassed =
          deliveryDate < today;

        return hasRemaining && datePassed;

      })

      // convert structure
      ?.map((item) => {

        const order = item?.node;

        // remaining balance
        const balance =
          order?.total_payment -
          order?.advance;

        return {

          branch:
            order?.clinic_attend_customer
              ?.customer_has_branch
              ?.branch
              ?.branch_name,

          clinic:
            order?.venue,

          total: balance,

          orders: [
            {
              id: `OD${order?.id}`,

              amount: balance,
            },
          ],
        };

      }) || [];

  // branch filter
  const filteredData =
    selectedBranch === "All"
      ? recoveryData
      : recoveryData.filter(
          (item) =>
            item.branch === selectedBranch
        );

  // grand total
  const grandTotal =
    filteredData.reduce(
      (sum, item) => sum + item.total,
      0
    );

  return (
    <div className="p-6 space-y-6">

      {/* Title */}
      <h1 className="text-2xl font-semibold">
        Recovery Details
      </h1>

      {/* Filter */}
      <Card>

        <div className="space-y-3">

          <p className="font-medium">
            Search By Branch
          </p>

          <Select
            className="w-[200px]"

            value={selectedBranch}

            onChange={setSelectedBranch}

            options={[

              {
                value: "All",
                label: "All",
              },

              ...(branchData?.branchCollection?.edges?.map((b) => ({

                value: b?.node?.branch_name,

                label: b?.node?.branch_name,

              })) || [])

            ]}
          />

        </div>

      </Card>

      {/* Content */}
      <Card className="space-y-6">

        <h2 className="text-lg font-semibold">

          Extra Recovery Details - {selectedBranch}

        </h2>

        {/* Loading */}
        {loading && (
          <p>Loading...</p>
        )}

        {/* Error */}
        {error && (
          <p>Error loading data</p>
        )}

        {/* No Data */}
        {!loading &&
          filteredData.length === 0 && (
            <p>No data available</p>
          )}

        {/* Data */}
        <div className="space-y-4">

          {filteredData.map((clinic) => (

            <div
              key={clinic.clinic}
              className="border rounded-lg"
            >

              {/* Header */}
              <div className="flex justify-between p-4 font-medium">

                <span>
                  {clinic.clinic}
                </span>

                <span className="text-red-500">

                  Total: LKR{" "}
                  {clinic.total.toLocaleString()}

                </span>

              </div>

              {/* Table Header */}
              <div className="flex justify-between bg-gray-100 p-3 text-sm font-medium">

                <span>Order ID</span>

                <span>Amount</span>

              </div>

              {/* Orders */}
              {clinic.orders.map((order) => (

                <div
                  key={order.id}
                  className="flex justify-between p-3"
                >

                  <span>
                    {order.id}
                  </span>

                  <span className="text-red-500">

                    LKR{" "}
                    {order.amount.toLocaleString()}

                  </span>

                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between p-4 bg-blue-100 font-semibold">

                <span>Total</span>

                <span className="text-red-500">

                  LKR{" "}
                  {clinic.total.toLocaleString()}

                </span>

              </div>

            </div>
          ))}

        </div>

      </Card>

      {/* Grand Total */}
      <div className="bg-blue-100 p-6 rounded-xl flex justify-end text-lg font-semibold">

        Grand Total:

        <span className="text-red-500 ml-2">

          LKR {grandTotal.toLocaleString()}

        </span>

      </div>

    </div>
  );
}
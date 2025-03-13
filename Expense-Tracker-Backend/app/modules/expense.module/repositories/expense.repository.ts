import { expenseModel, expenseValidator } from "../models/expense.model";
import { IExpense } from "../../../interfaces";
import { AggregatePaginateResult, PaginateOptions, Types } from "mongoose";

class expenseRepository {
  async addExpense(body: IExpense): Promise<IExpense> {
    try {
      const { error } = expenseValidator.validate(body);
      if (error) throw error;

      const data = new expenseModel(body);
      const newExpense: IExpense = await data.save();
      return newExpense;
    } catch (error: any) {
      throw new Error(error.message || "Something went wrong");
    }
  }


  /**
  * Retrieves expenses based on the provided match conditions and performs aggregation operations to include category and color details.
  *
  * @param matchConditions - The conditions to match expenses. Must include userId and any additional conditions.
  * @returns A promise that resolves to an array of IExpense objects.
  *
  * @throws Will throw an error if there is a database error or validation error.
  *
  * @remarks
  * This function uses MongoDB aggregation pipeline to perform the following tasks:
  * 1. Filters expenses based on the provided match conditions.
  * 2. Performs a left join with the Category collection using the categoryId field.
  * 3. Unwinds the category array to an object.
  * 4. Sorts expenses by date in descending order.
  * 5. Looks up color details from the Color collection using the category.colorId field.
  * 6. Unwinds the color array to an object.
  * 7. Optionally, projects the output to structure the response.
  */
  // async _getExpenses(matchConditions: { userId: Types.ObjectId } & Record<string, any>): Promise<any[]> {
  //   try {
  //     const expenses: any[] = await expenseModel.aggregate([
  //       // Filter expenses for the specific user
  //       {
  //         $match: matchConditions
  //       },

  //       // Perform a left join with the Category collection
  //       {
  //         $lookup: {
  //           from: "categories",
  //           localField: "categoryId",
  //           foreignField: "_id",
  //           as: "category"
  //         }
  //       },

  //       // Unwind the category array to an object
  //       {
  //         $unwind: {
  //           path: "$category",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },

  //       // Sort expenses by date in descending order
  //       {
  //         $sort: { date: -1 }
  //       },

  //       // Lookup color details from Color collection through category.colorId
  //       {
  //         $lookup: {
  //           from: "colors",
  //           localField: "category.colorId",
  //           foreignField: "_id",
  //           as: "category.color"
  //         }
  //       },

  //       // Unwind the color array to an object
  //       { $unwind: { path: "$category.color", preserveNullAndEmptyArrays: true } },

  //       // Optionally, project the output to structure the response
  //       {
  //         $project: {
  //           _id: 1,
  //           userId: 1,
  //           date: 1,
  //           amount: 1,
  //           type: 1,
  //           description: 1,
  //           category: {
  //             _id: 1,
  //             name: 1,
  //             description: 1,
  //             isDefault: 1,
  //             color: {
  //               _id: 1,
  //               name: 1,
  //               hexCode: 1
  //             }
  //           },
  //           documents: 1,
  //           createdAt: 1,
  //           updatedAt: 1
  //         }
  //       }
  //     ]);

  //     return expenses;
  //   } catch (error: any) {
  //     throw new Error(error.message || "Something went wrong");
  //   }
  // }

  async getExpenses(
    matchConditions: { userId: Types.ObjectId } & Record<string, any>,
    options: PaginateOptions
  ): Promise<AggregatePaginateResult<any>> {
    try {
      const aggregationPipeline: any = [
        // Match expenses for the specific user
        { $match: matchConditions },

        // Perform a left join with the Category collection
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
          }
        },

        // Unwind the category array to an object
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true
          }
        },

        // Sort expenses by date in descending order
        { $sort: { date: -1 } },

        // Lookup color details from Color collection through category.colorId
        {
          $lookup: {
            from: "colors",
            localField: "category.colorId",
            foreignField: "_id",
            as: "category.color"
          }
        },

        // Unwind the color array to an object
        { $unwind: { path: "$category.color", preserveNullAndEmptyArrays: true } },

        // Optionally, project the output to structure the response
        {
          $project: {
            _id: 1,
            userId: 1,
            date: 1,
            amount: 1,
            type: 1,
            description: 1,
            category: {
              _id: 1,
              name: 1,
              description: 1,
              isDefault: 1,
              color: {
                _id: 1,
                name: 1,
                hexCode: 1
              }
            },
            documents: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ];


      if (!options.limit || options.limit <= 0) { options.pagination = false };  // if limit is not provided pagination will be disabled
      let expenses: AggregatePaginateResult<any> = await expenseModel.aggregatePaginate(aggregationPipeline, options);

      return expenses;
    } catch (error: any) {
      throw new Error(error.message || "Something went wrong");
    }
  }


  /**
   * Retrieves expenses grouped by category, including total amount and category details.
   *
   * @param matchConditions - The conditions to match expenses. Must include userId and type ('cash-in' | 'cash-out').
   * @param dateRange - The optional date range to filter expenses. Can include startDate and endDate (YYYY-MM-DD).
   * @returns A promise that resolves to an array of objects containing category-wise expense details.
   *
   * @throws Will throw an error if there is a database error or validation error.
   *
   * @remarks
   * This function uses MongoDB aggregation pipeline to perform the following tasks:
   * 1. Filters expenses based on the provided match conditions and date range.
   * 2. Looks up category details using the categoryId field.
   * 3. Looks up color details from the Color collection using the category.colorId field.
   * 4. Groups expenses by category and calculates total amount.
   * 5. Projects the desired fields in the response.
   */
  async getExpensesCategoryWise(
    matchConditions: { userId: Types.ObjectId; type: 'cash-in' | 'cash-out' },
    dateRange: { startDate?: string; endDate?: string },
    options: PaginateOptions
  ): Promise<AggregatePaginateResult<any>> {
    try {
      const dateFilter = dateRange && (dateRange?.startDate || dateRange?.endDate)
        ? {
          ...(dateRange?.startDate && { $gte: new Date(new Date(dateRange.startDate).setHours(0, 0, 0, 0)) }),
          ...(dateRange?.endDate && {
            // Add 1 day to endDate and use $lt to include the full day
            $lt: new Date(new Date(dateRange.endDate).getTime() + 24 * 60 * 60 * 1000),
          }),
        }
        : {};

      const fullMatchConditions = {
        ...matchConditions,
        ...(Object.keys(dateFilter).length && { date: dateFilter }),
      };

      const aggregationPipeline: any = [
        // Match the expenses with conditions
        { $match: fullMatchConditions },

        // Lookup to fetch category details
        {
          $lookup: {
            from: 'categories', // Collection name for categories
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },

        // Unwind the category array to a single object
        { $unwind: '$category' },

        // Lookup to fetch color details inside the category
        {
          $lookup: {
            from: 'colors', // Collection name for colors
            localField: 'category.colorId',
            foreignField: '_id',
            as: 'category.color',
          },
        },

        // Unwind the color array to a single object
        { $unwind: { path: '$category.color', preserveNullAndEmptyArrays: true } },

        // Group by categoryId and calculate the total amount
        {
          $group: {
            _id: '$categoryId',
            totalAmount: { $sum: '$amount' },
            categoryDetails: { $first: '$category' },
          },
        },

        // Project the desired fields in the response
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            category: {
              _id: '$categoryDetails._id',
              name: '$categoryDetails.name',
              description: '$categoryDetails.description',
              color: {
                _id: '$categoryDetails.color._id',
                name: '$categoryDetails.color.name',
                hexCode: '$categoryDetails.color.hexCode',
              },
            },
          },
        },
      ]

      if (!options.limit || options.limit <= 0) { options.pagination = false };  // if limit is not provided pagination will be disabled
      const expenses = await expenseModel.aggregatePaginate(aggregationPipeline, options);

      return expenses;
    } catch (error: any) {
      throw new Error(error.message || 'Something went wrong');
    }
  }


  /**
   * Retrieves a report of expenses based on the provided match conditions and date range.
   *
   * @param matchConditions - The conditions to match expenses. Must include userId.
   * @param dateRange - The optional date range to filter expenses. Can include startDate and endDate (YYYY-MM-DD).
   * @returns A promise that resolves to an array of IExpense objects containing the report data.
   *
   * @throws Will throw an error if there is a database error or validation error.
   *
   * @remarks
   * This function uses MongoDB aggregation pipeline to perform the following tasks:
   * 1. Filters expenses based on the provided match conditions and date range.
   * 2. Looks up category details using the categoryId field.
   * 3. Looks up color details from the Color collection using the category.colorId field.
   * 4. Sorts expenses by date in descending order.
   * 5. Groups expenses and calculates total cash in, total cash out, and remaining cash.
   * 6. Projects the final response structure.
   */
  // async _getExpensesReport(  // OLD 
  //   matchConditions: { userId: Types.ObjectId } & Record<string, any>,
  //   dateRange: { startDate?: string, endDate?: string }
  // ): Promise<IExpense[]> {
  //   try {
  //     // Construct the date filter based on optional startDate and endDate
  //     const dateFilter = dateRange && (dateRange?.startDate || dateRange?.endDate) ?
  //       {
  //         ...(dateRange?.startDate && { $gte: new Date(new Date(dateRange.startDate).setHours(0, 0, 0, 0)) }),
  //         ...(dateRange?.endDate && {
  //           // Add 1 day to endDate and use $lt to include the full day
  //           $lt: new Date(new Date(dateRange.endDate).getTime() + 24 * 60 * 60 * 1000)
  //         })
  //       } : {};
  //     // Example match conditions
  //     // {
  //     //   userId: "67a0d3c13930e10e33fa685b",
  //     //   date: { $gte: "2025-02-01T00:00:00.000Z", $lte: "2025-02-21T00:00:00.000Z" }
  //     // }
  //     // OR if only startDate is provided
  //     // {
  //     //   userId: "67a0d3c13930e10e33fa685b",
  //     //   date: { $gte: "2025-02-01T00:00:00.000Z" }
  //     // }

  //     // Merge date filter into match conditions if applicable
  //     const fullMatchConditions = {
  //       ...matchConditions,
  //       ...(Object.keys(dateFilter).length && { date: dateFilter })
  //     };

  //     const expenses: IExpense[] = await expenseModel.aggregate([
  //       // Filter expenses for the specific user and date range if provided
  //       { $match: fullMatchConditions },

  //       // Lookup category details
  //       {
  //         $lookup: {
  //           from: "categories",
  //           localField: "categoryId",
  //           foreignField: "_id",
  //           as: "category"
  //         }
  //       },
  //       { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

  //       // Lookup color details from Color collection through category.colorId
  //       {
  //         $lookup: {
  //           from: "colors",
  //           localField: "category.colorId",
  //           foreignField: "_id",
  //           as: "category.color"
  //         }
  //       },
  //       { $unwind: { path: "$category.color", preserveNullAndEmptyArrays: true } },

  //       // Sort expenses by date in descending order
  //       { $sort: { date: -1 } },

  //       // // Project only required fields for expenses
  //       // {
  //       //   $project: {
  //       //     _id: 1,
  //       //     userId: 1,
  //       //     date: 1,
  //       //     amount: 1,
  //       //     description: 1,
  //       //     type: 1,
  //       //     documents: 1,
  //       //     category: {
  //       //       _id: 1,
  //       //       name: 1,
  //       //       description: 1,
  //       //       isDefault: 1,
  //       //       color: {
  //       //         _id: 1,
  //       //         name: 1,
  //       //         hexCode: 1
  //       //       }
  //       //     },
  //       //     createdAt: 1,
  //       //     updatedAt: 1
  //       //   }
  //       // },

  //       // // Group expenses and calculate totals
  //       // {
  //       //   $group: {
  //       //     _id: null,
  //       //     expenses: { $push: "$$ROOT" },
  //       //     totalCashIn: {
  //       //       $sum: {
  //       //         $cond: [{ $eq: ["$type", "cash-in"] }, "$amount", 0]
  //       //       }
  //       //     },
  //       //     totalCashOut: {
  //       //       $sum: {
  //       //         $cond: [{ $eq: ["$type", "cash-out"] }, "$amount", 0]
  //       //       }
  //       //     }
  //       //   }
  //       // },

  //       // // Add remaining cash as a computed field
  //       // {
  //       //   $addFields: {
  //       //     remainingCash: { $subtract: ["$totalCashIn", "$totalCashOut"] }
  //       //   }
  //       // },

  //       // Group to calculate totals and aggregate expenses  [Above one and this both works same]
  //       {
  //         $group: {
  //           _id: null,
  //           expenses: {
  //             $push: {
  //               _id: "$_id",
  //               userId: "$userId",
  //               date: "$date",
  //               amount: "$amount",
  //               description: "$description",
  //               type: "$type",
  //               documents: "$documents",
  //               category: {
  //                 _id: "$category._id",
  //                 name: "$category.name",
  //                 description: "$category.description",
  //                 isDefault: "$category.isDefault",
  //                 color: {
  //                   _id: "$category.color._id",
  //                   name: "$category.color.name",
  //                   hexCode: "$category.color.hexCode"
  //                 }
  //               },
  //               createdAt: "$createdAt",
  //               updatedAt: "$updatedAt"
  //             }
  //           },
  //           totalCashIn: {
  //             $sum: { $cond: [{ $eq: ["$type", "cash-in"] }, "$amount", 0] }
  //           },
  //           totalCashOut: {
  //             $sum: { $cond: [{ $eq: ["$type", "cash-out"] }, "$amount", 0] }
  //           }
  //         }
  //       },

  //       // Calculate remaining cash
  //       {
  //         $addFields: {
  //           remainingCash: { $subtract: ["$totalCashIn", "$totalCashOut"] }
  //         }
  //       },

  //       // Project the final response structure
  //       {
  //         $project: {
  //           _id: 0,
  //           expenses: 1,
  //           totalCashIn: 1,
  //           totalCashOut: 1,
  //           remainingCash: 1
  //         }
  //       }
  //     ]);

  //     return expenses;
  //   } catch (error: any) {
  //     throw new Error(error.message || "Something went wrong");
  //   }


  //   /** Output: */
  //   // [
  //   //     {
  //   //         "expenses": [
  //   //             {
  //   //                 "_id": "67b888943b9da33656566630",
  //   //                 "userId": "67a0d3c13930e10e33fa685b",
  //   //                 "date": "2025-02-21T13:59:24.368Z",
  //   //                 "amount": 230,
  //   //                 "description": "sdf",
  //   //                 "type": "cash-out",
  //   //                 "documents": [],
  //   //                 "category": {
  //   //                     "_id": "67af3466ef2d50ecaf18b05d",
  //   //                     "name": "Category-2",
  //   //                     "description": "Category-2 description",
  //   //                     "isDefault": true,
  //   //                     "color": {
  //   //                         "_id": "67a4b823df6cedadaaaac3f3",
  //   //                         "name": "DarkRed",
  //   //                         "hexCode": "#8B0000"
  //   //                     }
  //   //                 },
  //   //                 "createdAt": "2025-02-21T14:07:16.160Z",
  //   //                 "updatedAt": "2025-02-21T14:07:16.160Z"
  //   //             },
  //   //             {
  //   //                 "_id": "67b888a33b9da33656566633",
  //   //                 "userId": "67a0d3c13930e10e33fa685b",
  //   //                 "date": "2025-02-21T13:59:24.368Z",
  //   //                 "amount": 1030,
  //   //                 "description": "570",
  //   //                 "type": "cash-out",
  //   //                 "documents": [],
  //   //                 "category": {
  //   //                     "_id": "67af3466ef2d50ecaf18b05d",
  //   //                     "name": "Category-2",
  //   //                     "description": "Category-2 description",
  //   //                     "isDefault": true,
  //   //                     "color": {
  //   //                         "_id": "67a4b823df6cedadaaaac3f3",
  //   //                         "name": "DarkRed",
  //   //                         "hexCode": "#8B0000"
  //   //                     }
  //   //                 },
  //   //                 "createdAt": "2025-02-21T14:07:31.262Z",
  //   //                 "updatedAt": "2025-02-21T14:07:31.262Z"
  //   //             },
  //   //             {
  //   //                 "_id": "67b861d683fab7ccacb029a3",
  //   //                 "userId": "67a0d3c13930e10e33fa685b",
  //   //                 "date": "2025-02-21T11:18:21.886Z",
  //   //                 "amount": 600,
  //   //                 "description": "cd",
  //   //                 "type": "cash-out",
  //   //                 "documents": [
  //   //                     {
  //   //                         "path": "http://localhost:5503/uploads/expense/67a0d3c13930e10e33fa685b/1740136918442-371355304.jpg",
  //   //                         "originalName": "user2.jpg",
  //   //                         "_id": "67b861d683fab7ccacb029a4"
  //   //                     },
  //   //                     {
  //   //                         "path": "http://localhost:5503/uploads/expense/67a0d3c13930e10e33fa685b/1740136918443-531324801.jpg",
  //   //                         "originalName": "user.jpg",
  //   //                         "_id": "67b861d683fab7ccacb029a5"
  //   //                     }
  //   //                 ],
  //   //                 "category": {
  //   //                     "_id": "67a5b3488f61c4642c10493b",
  //   //                     "name": "Category-1",
  //   //                     "description": "Category-1 description",
  //   //                     "isDefault": true,
  //   //                     "color": {
  //   //                         "_id": "67a4b6c4df6cedadaaaac3c3",
  //   //                         "name": "IndianRed",
  //   //                         "hexCode": "#CD5C5C"
  //   //                     }
  //   //                 },
  //   //                 "createdAt": "2025-02-21T11:21:58.453Z",
  //   //                 "updatedAt": "2025-02-21T11:21:58.453Z"
  //   //             },
  //   //             {
  //   //                 "_id": "67b819ca9bf59bc3afe7a926",
  //   //                 "userId": "67a0d3c13930e10e33fa685b",
  //   //                 "date": "2025-02-21T06:12:22.105Z",
  //   //                 "amount": 100000,
  //   //                 "description": "abcd",
  //   //                 "type": "cash-in",
  //   //                 "documents": [
  //   //                     {
  //   //                         "path": "http://localhost:5503/uploads/expense/67a0d3c13930e10e33fa685b/1740118474891-428535597.jpg",
  //   //                         "originalName": "7.jpg",
  //   //                         "_id": "67b819ca9bf59bc3afe7a927"
  //   //                     },
  //   //                     {
  //   //                         "path": "http://localhost:5503/uploads/expense/67a0d3c13930e10e33fa685b/1740118474893-977931585.xlsx",
  //   //                         "originalName": "custom_users_data (5).xlsx",
  //   //                         "_id": "67b819ca9bf59bc3afe7a928"
  //   //                     },
  //   //                     {
  //   //                         "path": "http://localhost:5503/uploads/expense/67a0d3c13930e10e33fa685b/1740118474894-380876537.docx",
  //   //                         "originalName": "PZ Update March 3 ,2023 (1).docx",
  //   //                         "_id": "67b819ca9bf59bc3afe7a929"
  //   //                     }
  //   //                 ],
  //   //                 "category": {
  //   //                     "_id": "67a5b3488f61c4642c10493b",
  //   //                     "name": "Category-1",
  //   //                     "description": "Category-1 description",
  //   //                     "isDefault": true,
  //   //                     "color": {
  //   //                         "_id": "67a4b6c4df6cedadaaaac3c3",
  //   //                         "name": "IndianRed",
  //   //                         "hexCode": "#CD5C5C"
  //   //                     }
  //   //                 },
  //   //                 "createdAt": "2025-02-21T06:14:34.908Z",
  //   //                 "updatedAt": "2025-02-21T06:14:34.908Z"
  //   //             },
  //   //             {
  //   //                 "_id": "67b81a279bf59bc3afe7a92c",
  //   //                 "userId": "67a0d3c13930e10e33fa685b",
  //   //                 "date": "2025-02-21T06:12:22.105Z",
  //   //                 "amount": 10000,
  //   //                 "description": "ab",
  //   //                 "type": "cash-out",
  //   //                 "documents": [
  //   //                     {
  //   //                         "path": "http://localhost:5503/uploads/expense/67a0d3c13930e10e33fa685b/1740118567295-367169830.jpg",
  //   //                         "originalName": "7.jpg",
  //   //                         "_id": "67b81a279bf59bc3afe7a92d"
  //   //                     }
  //   //                 ],
  //   //                 "category": {
  //   //                     "_id": "67a5b3488f61c4642c10493b",
  //   //                     "name": "Category-1",
  //   //                     "description": "Category-1 description",
  //   //                     "isDefault": true,
  //   //                     "color": {
  //   //                         "_id": "67a4b6c4df6cedadaaaac3c3",
  //   //                         "name": "IndianRed",
  //   //                         "hexCode": "#CD5C5C"
  //   //                     }
  //   //                 },
  //   //                 "createdAt": "2025-02-21T06:16:07.302Z",
  //   //                 "updatedAt": "2025-02-21T06:16:07.302Z"
  //   //             }
  //   //         ],
  //   //         "totalCashIn": 100000,
  //   //         "totalCashOut": 11860,
  //   //         "remainingCash": 88140
  //   //     }
  //   // ]
  // }
  // async getExpensesReport(  [format not currect]
  //   matchConditions: { userId: Types.ObjectId; type?: "cash-in" | "cash-out" } & Record<string, any>,
  //   dateRange: { startDate?: string; endDate?: string },
  //   options: PaginateOptions
  // ): Promise<{
  //   expenses: AggregatePaginateResult<any>;
  //   totals: { totalCashIn: number; totalCashOut: number; remainingCash: number };
  // }> {
  //   try {
  //     // Construct the date filter based on optional startDate and endDate
  //     const dateFilter =
  //       dateRange && (dateRange.startDate || dateRange.endDate)
  //         ? {
  //             ...(dateRange.startDate && { $gte: new Date(new Date(dateRange.startDate).setHours(0, 0, 0, 0)) }),
  //             ...(dateRange.endDate && {
  //               $lt: new Date(new Date(dateRange.endDate).getTime() + 24 * 60 * 60 * 1000),
  //             }),
  //           }
  //         : {};

  //     // Ensure the type filter is included in matchConditions
  //     const typeFilter = matchConditions.type ? { type: matchConditions.type } : {};

  //     // Merge filters into match conditions
  //     const fullMatchConditions = {
  //       ...matchConditions,
  //       ...typeFilter, // Add type filter explicitly
  //       ...(Object.keys(dateFilter).length && { date: dateFilter }),
  //     };

  //     const aggregationPipeline: any = [
  //       { $match: fullMatchConditions }, // Ensure filtering by user, date, and type

  //       // Lookup category details
  //       {
  //         $lookup: {
  //           from: "categories",
  //           localField: "categoryId",
  //           foreignField: "_id",
  //           as: "category",
  //         },
  //       },
  //       { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

  //       // Lookup color details
  //       {
  //         $lookup: {
  //           from: "colors",
  //           localField: "category.colorId",
  //           foreignField: "_id",
  //           as: "category.color",
  //         },
  //       },
  //       { $unwind: { path: "$category.color", preserveNullAndEmptyArrays: true } },

  //       {
  //         $facet: {
  //           // **Totals Pipeline**
  //           totals: [
  //             { $match: fullMatchConditions }, // Ensure type filtering applies here
  //             {
  //               $group: {
  //                 _id: null,
  //                 totalCashIn: {
  //                   $sum: {
  //                     $cond: [{ $eq: ["$type", "cash-in"] }, "$amount", 0],
  //                   },
  //                 },
  //                 totalCashOut: {
  //                   $sum: {
  //                     $cond: [{ $eq: ["$type", "cash-out"] }, "$amount", 0],
  //                   },
  //                 },
  //               },
  //             },
  //             {
  //               $project: {
  //                 _id: 0,
  //                 totalCashIn: 1,
  //                 totalCashOut: 1,
  //                 remainingCash: { $subtract: ["$totalCashIn", "$totalCashOut"] },
  //               },
  //             },
  //           ],

  //           // **Expenses Pipeline**
  //           expenses: [
  //             { $match: fullMatchConditions }, // Ensure filtering applies
  //             { $sort: { date: -1 } },
  //             {
  //               $project: {
  //                 _id: 1,
  //                 userId: 1,
  //                 date: 1,
  //                 amount: 1,
  //                 description: 1,
  //                 type: 1,
  //                 documents: 1,
  //                 category: {
  //                   _id: 1,
  //                   name: 1,
  //                   description: 1,
  //                   isDefault: 1,
  //                   color: {
  //                     _id: 1,
  //                     name: 1,
  //                     hexCode: 1,
  //                   },
  //                 },
  //                 createdAt: 1,
  //                 updatedAt: 1,
  //               },
  //             },
  //           ],
  //         },
  //       },

  //       { $unwind: "$totals" },
  //     ];

  //     // Disable pagination if limit is not provided or invalid
  //     if (!options.limit || options.limit <= 0) {
  //       options.pagination = false;
  //     }

  //     // Execute aggregation pipeline
  //     const [result] = await expenseModel.aggregate(aggregationPipeline);

  //     // Paginate the expenses array correctly
  //     const expenses: any = await expenseModel.aggregatePaginate(
  //       [{ $match: fullMatchConditions }], // Ensure correct filtering
  //       options,
  //       result?.expenses || []
  //     );

  //     return {
  //       ...expenses,
  //       report: result?.totals || [],
  //     };
  //   } catch (error: any) {
  //     throw new Error(error.message || "Something went wrong");
  //   }
  // }
  async getExpensesReport(
    matchConditions: { userId: Types.ObjectId; type?: "cash-in" | "cash-out" } & Record<string, any>,
    dateRange: { startDate?: string | Date; endDate?: string | Date },
    options: PaginateOptions
  ): Promise<any> {
    try {
      // Construct the date filter based on optional startDate and endDate
      const dateFilter =
        dateRange && (dateRange.startDate || dateRange.endDate)
          ? {
            ...(dateRange.startDate && { $gte: new Date(new Date(dateRange.startDate).setHours(0, 0, 0, 0)) }),
            ...(dateRange.endDate && {
              // Add one day to include the entire end date
              $lt: new Date(new Date(dateRange.endDate).getTime() + 24 * 60 * 60 * 1000),
            }),
          }
          : {};

      // Ensure the type filter is included if provided
      const typeFilter = matchConditions.type ? { type: matchConditions.type } : {};

      // Merge filters into match conditions
      const fullMatchConditions = {
        ...matchConditions,
        ...typeFilter,
        ...(Object.keys(dateFilter).length && { date: dateFilter }),
      };

      // --- Report Pipeline ---
      // This pipeline calculates the totals (cash-in, cash-out, and remaining cash)
      const reportPipeline: any = [
        { $match: fullMatchConditions },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "colors",
            localField: "category.colorId",
            foreignField: "_id",
            as: "category.color",
          },
        },
        { $unwind: { path: "$category.color", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalCashIn: {
              $sum: { $cond: [{ $eq: ["$type", "cash-in"] }, "$amount", 0] },
            },
            totalCashOut: {
              $sum: { $cond: [{ $eq: ["$type", "cash-out"] }, "$amount", 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalCashIn: 1,
            totalCashOut: 1,
            remainingCash: { $subtract: ["$totalCashIn", "$totalCashOut"] },
          },
        },
      ];

      const [reportResult] = await expenseModel.aggregate(reportPipeline);

      // --- Expenses Pipeline ---
      // This pipeline returns the expense documents with lookup details and sorted by date.
      const expensesPipeline: any = [
        { $match: fullMatchConditions },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "colors",
            localField: "category.colorId",
            foreignField: "_id",
            as: "category.color",
          },
        },
        { $unwind: { path: "$category.color", preserveNullAndEmptyArrays: true } },
        { $sort: { date: -1 } },
        {
          $project: {
            _id: 1,
            userId: 1,
            date: 1,
            amount: 1,
            description: 1,
            type: 1,
            documents: 1,
            category: {
              _id: 1,
              name: 1,
              description: 1,
              isDefault: 1,
              color: {
                _id: 1,
                name: 1,
                hexCode: 1,
              },
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      // Disable pagination if limit is missing or invalid
      if (!options.limit || options.limit <= 0) {
        options.pagination = false;
      }

      // Use aggregatePaginate with the full expenses pipeline that includes lookup stages.
      const expenses = await expenseModel.aggregatePaginate(expensesPipeline, options);

      // Return the final result with paginated expenses and the totals report.
      return {
        ...expenses,
        report: reportResult || { totalCashIn: 0, totalCashOut: 0, remainingCash: 0 },
      };
    } catch (error: any) {
      throw new Error(error.message || "Something went wrong");
    }
  }



  async updateExpenses(expenseId: Types.ObjectId, body: IExpense): Promise<IExpense | null> {
    try {
      const { error } = expenseValidator.validate(body);
      if (error) throw error;

      const updatedExpense: IExpense | null = await expenseModel.findByIdAndUpdate(expenseId, body, { new: true });
      return updatedExpense;
    } catch (error: any) {
      throw new Error(error.message || "Something went wrong");
    }
  }



  async deleteExpenses(matchCondition: { _id: Types.ObjectId, userId: Types.ObjectId }): Promise<IExpense | null> {
    try {
      const deletedExpense: IExpense | null = await expenseModel.findOneAndDelete(matchCondition);
      return deletedExpense;
    } catch (error: any) {
      throw new Error(error.message || "Something went wrong");
    }
  }
}

export default new expenseRepository();

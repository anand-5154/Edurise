import { IWallet } from "../../models/interfaces/Iwallet.interface";
import { IWalletRepository } from "../interfaces/Iwallet.interface";
import Wallet from "../../models/implementations/walletModel";
import mongoose, { Types } from "mongoose";
import { ITransaction } from "../../models/interfaces/Iwallet.interface";

export class WalletRepository implements IWalletRepository {
  async creditWallet({
    ownerType,
    ownerId,
    amount,
    courseId,
    description,
    courseTitle,
  }: {
    ownerType: "user" | "instructors" | "admin";
    ownerId?: string | Types.ObjectId;
    amount: number;
    courseId: string;
    description: string;
    courseTitle?: string;
  }): Promise<IWallet | null> {
    if (ownerType !== "admin" && !ownerId) {
      throw new Error("ownerId is required for non-admin wallets");
    }
    const query =
      ownerType === "admin" ? { ownerType } : { ownerType, ownerId };
    return await Wallet.findOneAndUpdate(
      query,
      {
        $inc: { balance: amount },
        $push: {
          transactions: {
            type: "credit",
            amount,
            courseId,
            description,
            courseTitle,
          },
        },
      },
      { upsert: true, new: true }
    );
  }

  async debitWallet({
    ownerType,
    ownerId,
    amount,
    courseId,
    description,
    courseTitle,
  }: {
    ownerType: "user" | "instructors" | "admin";
    ownerId?: string | Types.ObjectId;
    amount: number;
    courseId: string;
    description: string;
    courseTitle?: string;
  }): Promise<IWallet | null> {
    if (ownerType !== "admin" && !ownerId) {
      throw new Error("ownerId is required for non-admin wallets");
    }
    const query =
      ownerType === "admin" ? { ownerType } : { ownerType, ownerId };
    const wallet = await Wallet.findOne(query);
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.balance < amount) throw new Error("Insufficient funds");
    return await Wallet.findOneAndUpdate(
      query,
      {
        $inc: { balance: -amount },
        $push: {
          transactions: {
            type: "debit",
            amount,
            courseId,
            description,
            courseTitle,
          },
        },
      },
      { new: true }
    );
  }

  async findWalletOfInstructor(
    InstructorId:string,
    page: number,
    limit: number
  ): Promise<{
    wallet: Partial<IWallet>;
    transactions: ITransaction[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const wallet = await Wallet.findOne({ ownerId: InstructorId })
      .select("balance transactions")
      .lean();

    const allTransactions = wallet?.transactions || [];

    const total = allTransactions.length;
    const totalPages = Math.ceil(total / limit);

    const paginatedTransactions = allTransactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    return {
      wallet: { balance: wallet?.balance || 0 },
      transactions: paginatedTransactions,
      total,
      totalPages,
    };
  }

  async findWalletOfAdmin(
    page: number,
    limit: number
  ): Promise<{
    wallet: Partial<IWallet>;
    transactions: ITransaction[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const wallet = await Wallet.findOne({ ownerType: "admin" })
      .select("balance transactions")
      .lean();

    const allTransactions = wallet?.transactions || [];

    const total = allTransactions.length;
    const totalPages = Math.ceil(total / limit);

    const paginatedTransactions = allTransactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    return {
      wallet: { balance: wallet?.balance || 0 },
      transactions: paginatedTransactions,
      total,
      totalPages,
    };
  }

  async findWalletOfUser(userId: string, page: number, limit: number): Promise<{wallet: Partial<IWallet>, total: number, totalPages: number, transactions: ITransaction[]}> {
    const skip = (page - 1) * limit;
    const wallet = await Wallet.findOne({ ownerType: "user", ownerId: userId })
      .select("balance transactions")
      .lean();
    const allTransactions = wallet?.transactions || [];
    const total = allTransactions.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedTransactions = allTransactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);
    return {
      wallet: { balance: wallet?.balance || 0 },
      transactions: paginatedTransactions,
      total,
      totalPages,
    };
  }

  async getIncomeStats(): Promise<{ month: string; revenue: number }[]> {
    const results = await Wallet.aggregate([
      { $match: { ownerType: "admin" } },
      { $unwind: "$transactions" },
      {
        $group: {
          _id: {
            year: { $year: "$transactions.createdAt" },
            month: { $month: "$transactions.createdAt" },
          },
          totalRevenue: { $sum: "$transactions.amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    "",
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  "$_id.month",
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          revenue: { $toDouble: "$totalRevenue" },
        },
      },
    ]);

    return results.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue),
    }));
  }

  async getIncome(instructorId: string): Promise<{month:string,revenue:number}[]> {
    const results = await Wallet.aggregate([
      {
        $match: {
          ownerType: "instructors",
          ownerId: new mongoose.Types.ObjectId(instructorId),
        },
      },
      { $unwind: "$transactions" },
      {
        $group: {
          _id: {
            year: { $year: "$transactions.createdAt" },
            month: { $month: "$transactions.createdAt" },
          },
          totalRevenue: { $sum: "$transactions.amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    "",
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  "$_id.month",
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          revenue: { $toDouble: "$totalRevenue" },
        },
      },
    ]);

    return results.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue),
    }));
  }
}

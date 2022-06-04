const mongoose = require('mongoose');
const User = require('../models/userModel');
const ChatRoom = require('../models/chatRoomModel');
const appError = require('../service/appError');

const { ObjectId } = mongoose.Types;
const idPath = '_id';

const chatController = {
  async getChatRecord(req, res) {
    const queryResult = await User.aggregate([
      { $match: { _id: req.user[idPath] } },
      {
        $project: { chatRecord: 1 },
      },
      {
        $unwind: '$chatRecord',
      },
      {
        $lookup: {
          from: 'chatrooms',
          let: {
            roomId: '$chatRecord.roomId',
            chatRecord: '$chatRecord',
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$roomId'] } } },
            {
              $project: { messages: 1, _id: 0 },
            },
            {
              $replaceRoot: {
                newRoot: { message: { $slice: ['$messages', -1] } },
              },
            },
          ],
          as: 'message',
        },
      },
      {
        $lookup: {
          from: 'Users',
          let: {
            receiverId: '$chatRecord.receiver',
            chatRecord: '$chatRecord',
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$receiverId'] } } },
            {
              $project: { avatar: 1, name: 1, _id: 0 },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$message',
      },
      {
        $unwind: '$user',
      },
      {
        $replaceRoot: {
          newRoot: {
            message: '$message.message',
            avatar: '$user.avatar',
            name: '$user.name',
            roomId: '$chatRecord.roomId',
          },
        },
      },
    ]);
    return res.send({ status: true, chatRecord: queryResult });
  },
  async postRoomInfo(req, res, next) {
    const sender = req.user[idPath].toString();
    const { receiver } = req.body;
    if (!receiver) {
      return next(appError(400, '未填寫聊天對象使用者id', next));
    }
    if (sender === receiver) {
      return next(appError(400, '自己不能跟自己聊天！', next));
    }
    const queryResult = await User.findById(sender).select('chatRecord');
    const { receiver: receiverRecord, roomId } = queryResult?.chatRecord.find(
      (item) => item.receiver.toString() === receiver,
    ) || {};
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return next(appError(400, '沒有這個人喔', next));
    }
    const { name, avatar, _id } = receiverUser;
    // 已經有聊天記錄就直接回傳id
    let resData;
    if (receiverRecord) {
      resData = {
        status: true,
        roomId,
        name,
        avatar,
        _id,
      };
    } else {
      // 沒有聊天記錄就新建房間
      const newRoom = await ChatRoom.create({
        members: [ObjectId(sender), ObjectId(receiver)],
      });
      await User.findByIdAndUpdate(sender, {
        $push: { chatRecord: { roomId: newRoom[idPath], receiver } },
      });
      await User.findByIdAndUpdate(receiver, {
        $push: { chatRecord: { roomId: newRoom[idPath], receiver: sender } },
      });
      resData = {
        status: true,
        roomId: newRoom[idPath],
        name,
        avatar,
        _id,
      };
    }
    return res.send(resData);
  },
  async deleteChatRecord(req, res) {
    await User.updateMany({}, { $set: { chatRecord: [] } });
    res.send({ status: true });
  },
  async deleteRoomRecord(req, res) {
    await ChatRoom.deleteMany({});
    res.send({ status: true });
  },
};

module.exports = chatController;

const FormData = require('form-data');
const axios = require('axios');
const sharp = require('sharp');
const console = require('../service/console');

// 可帶入寬高去改變原始圖檔尺寸，再上傳至 imgur
const Imgur = {
  async upload(files, imgWidth = null, imgHeight = null) {
    const uploadPromises = [];
    const imagesData = [];

    files.forEach((file) => {
      const formData = new FormData();
      const options = {
        method: 'post',
        url: 'https://api.imgur.com/3/image/',
        headers: {
          Authorization: `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`,
          ...formData.getHeaders(),
        },
        mimeType: 'multipart/form-data',
      };
      const imageBuffer = sharp(Buffer.from(file.buffer))
        .resize({ width: imgWidth, height: imgHeight });
      formData.append('image', imageBuffer);
      formData.append('album', process.env.IMGUR_ACCESS_ALBUM);

      uploadPromises.push(axios({ ...options, data: formData }));
    });

    await Promise.all(uploadPromises)
      .then((values) => {
        values.forEach((value) => {
          imagesData.push({
            deleteHash: value.data.data.deletehash,
            url: value.data.data.link,
          });
        });
      })
      .catch((err) => {
        console.log(err.response.data);
      });

    return imagesData;
  },
  async delete(files) {
    let result = '';
    const deletePromises = [];
    files.forEach((file) => {
      const settings = {
        method: 'delete',
        url: `https://api.imgur.com/3/image/${file.deleteHash}`,
        headers: {
          Authorization: `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`,
        },
      };
      deletePromises.push(axios(settings));
    });
    await Promise.all(deletePromises)
      .then((values) => {
        let countSuccess = 0;
        values.forEach((value) => {
          if (value.data.success) {
            countSuccess += 1;
          }
        });
        if (countSuccess === values.length) {
          result = '刪除成功';
        } else if (countSuccess > 0 && countSuccess < values.length) {
          result = '部分圖片刪除失敗';
        } else {
          result = '刪除失敗';
        }
      }).catch(() => {
        result = '刪除失敗';
      });

    return result;
  },
};

module.exports = Imgur;

const FormData = require('form-data');
const axios = require('axios');
const sharp = require('sharp');

// 可帶入寬高去改變原始圖檔尺寸，再上傳至 imgur
const Imgur = {
  async upload(files, imgWidth = null, imgHeight = null) {
    const imagesData = [];
    for (const file in files) {
      const formData = new FormData();
      const options = {
        method: 'post',
        url: 'https://api.imgur.com/3/image/',
        headers: {
          Authorization: `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`,
          ...formData.getHeaders()
        },
        mimeType: 'multipart/form-data',
      };
      const imageBuffer = sharp(Buffer.from(files[file].buffer))
        .resize({ width: imgWidth, height: imgHeight });
      formData.append('image', imageBuffer);
      formData.append('album', process.env.IMGUR_ACCESS_ALBUM);
      await axios({ ...options, data: formData })
        .then((res) => {
          imagesData.push({
            deleteHash: res.data.data.deletehash,
            url: res.data.data.link,
          });
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    }
    return imagesData;
  },
  async delete(files) {
    let result = '';
    for (const deleteHash in files) {
      const settings = {
        method: "delete",
        url: `https://api.imgur.com/3/image/${files[deleteHash]}`,
        headers: {
          Authorization: `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`
        },
      };
      await axios(settings).then((response) => {
        if (response.data.success) {
          result = '刪除成功';
        }
      }).catch(() => {
        result = '刪除失敗';
      })
    }
    return result
  }
}

module.exports = Imgur;

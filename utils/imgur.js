const FormData = require('form-data');
const axios = require('axios');

const Imgur = {
  async upload(files) {
    const imagesData = [];
    for (const file in files) {
      const formData = new FormData();
      const options = {
        method: 'post',
        url: 'https://api.imgur.com/3/image/',
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          ...formData.getHeaders()
        },
        mimeType: 'multipart/form-data',
      };
      formData.append('image', Buffer.from(files[file].buffer));
      formData.append('album', process.env.ACCESS_ALBUM);
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
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
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
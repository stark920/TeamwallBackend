const header = {
  'Access-Control-Allow-Headers':
  'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
  'Content-Type': 'application/json',
};

const errorMsg = {
  '400': 'Bad Request 格式不正確',
  '401': 'Unathorized',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Nor Acceptable'
}

const successHandler = (res, data) => {
  res.writeHead(200, header)
  res.write(JSON.stringify({
    "status": "success",
    "data": data
  }))
  res.end()
}

const errorHandler = (res, error= null, code=400) => {
  res.writeHead(404, header)
  res.write(JSON.stringify({
    "status": "false",
    "message": error? error.message: errorMsg[code],
    "error": error
  }))
  res.end()
}

module.exports={
  successHandler,
  errorHandler
}
function M_CheckParm(param){

  return myargs.includes(param.toLowerCase())

}

function M_GetParmIndex(param){

  return myargs.indexOf(param.toLowerCase())

}

module.exports = {
  M_CheckParm,
  M_GetParmIndex
}
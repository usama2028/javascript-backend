
const ascyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((error)=>next(error))
    }
}


export { ascyncHandler }


// const asyncHandler=(requestHandler)=>async(req,res,next)=>{
//     try {
//         await requestHandler(req,res,next)
//     } catch (error) {
//         res.status(error.code||500).json({
//             sucess:false,
//             message:error.message
//         })
//     }
// }
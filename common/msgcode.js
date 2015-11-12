
exports.UserNotFound = {
	code: 404001,
	message: "用户不存在"
};

exports.InvalidName = {
	code: 400001,
	message: "请正确填写姓名，至少两个字符"
};

exports.InvalidGender = {
	code: 400002,
	message: "请选择性别"
};

exports.InvalidAge = {
	code:400003,
	message: "无效的年龄"
};

exports.InvalidHeight = {
	code:400004,
	message: "无效的身高"
};

exports.InvalidWeight = {
	code:400005,
	message: "无效的体重"
};

exports.InvalidCountry = {
	code:400006,
	message: "请正确填写所在国家"
};

exports.TokenEmpty = {
	code:400007,
	message: "请正确填写所在城市"
};

exports.InvalidPhone = {
	code:400008,
	message: "请正确填写手机号"
};

exports.PhoneExisted = {
	code:400009,
	message: "该手机号已注册"
};

exports.InvalidZone = {
	code:400010,
	message: "请正确填写国家区号"
};

exports.MissingQRImage = {
	code:400011,
	message: "请上传您的二维码照片"
};

exports.MissingBodyFront = {
	code:400012,
	message: "请上传您的正面全身照片"
};

exports.MissingBodySide = {
	code:400013,
	message: "请上传您的侧面全身照片"
};

exports.ok = function(data) {
    data = data || {};
    data.code = 0;
    data.message = "success";
    return data;
}


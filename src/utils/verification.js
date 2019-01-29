import verify from '../config/verify';
import { showToast } from './index';



function verification (data) {

    if(data.username && !verify.username.test(data.username)){
        showToast('请输入以大小写字母开头6-16个字符的用户名');
        return 'username';
    };
    if(data.password && !verify.password.test(data.password)){
        showToast('请输入6-12个字符之间至少要有1个字母及数字的密码');
        return 'password';
    };
    if(data.newPassword && !verify.newPassword.test(data.newPassword)){
        showToast('您输入的新密码有误，请输入6-12个字符之间至少要有1个字母及数字的密码');
        return 'newPassword';
    };
    if(data.captcha && !verify.captcha.test(data.captcha)){
        showToast('请输入四位数字的验证吗');
        return 'captcha';
    };
    if(data.telephone && !verify.tel.test(data.telephone)){
        showToast('输入的手机号码有误');
        return 'telephone';
    };
    if(data.fundsPassword && !verify.fundsPassword.test(data.fundsPassword)){
        showToast('请输入六数字的提现密码');
        return 'fundsPassword';
    };
    if(data.newFundsPassword && !verify.newFundsPassword.test(data.fundsPassword)){
        showToast('请输入新的六位数字的提现密码');
        return 'fundsPassword';
    };
    return 'success';
};

export default verification

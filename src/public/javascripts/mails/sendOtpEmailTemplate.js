module.exports = (firstName, otp) => {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html" charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    
  </head>
  <body style="margin: 0;padding: 0;">
    <center class="wrapper" style="width: 100%;table-layout: fixed;background-color: #f6f9fc;padding-bottom: 40px;">
      <div class="webkit" style="max-width: 80%;background-color: #ffffff;padding-bottom: 20px;">
        <table class="outer" align="center" style="border-spacing: 0;margin: 0 auto;width: 100%;font-family: sans-serif;color: #4a4a4a;">
          <tr>
            <td style="padding: 0;">
              <table width="100%" style="border-spacing: 0;">
                <tr>
                  <td style="background-color:#2b1f68;padding:10px;text-align:center;">
                    <p style="margin:0;font-weight:bold;">
                      <a href="" style="text-decoration:none;color:#f6f9fc;font-weight: bolder;">
                        <img src="https://res.cloudinary.com/emmii/image/upload/v1680795241/Pipsgod%20Academy/logo_njzjyf.png" width="35px" alt="Logo" style="border: 0;">
                        <br>
                        Pipsgod Academy
                      </a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 10%;text-align:justify;">
              <table style="border-spacing: 0;">
                <tr>
                  <td style="padding: 0;">
                    <p style="margin-top: 50px;">Hello ${firstName},</p>
                    <p>
                      You have requested for a password reset on your Pipsgod Academy account. 
                      If you did, kindly enter the OTP below (valid for 5mins) to reset your password.
                    </p>
                  </td>
                </tr>

                <tr>
                    <td style="padding: 10px calc(50% - 40px)">
                      <p style="background:#439b73; border: none; font-weight: bold;
                      padding: 10px; color: white; border-radius: 5px; font-size:1rem;text-align: center;margin: 0">
                        ${otp}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <p>
                        If you did not request to reset your password, you can simply disregard this email and do not share with a third-party.
                        We assure the safety of your account.
                      </p>
                    </td>
                  </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 10%;text-align:justify;">
              <p>
                Regards, <br>
                The Pipsgod Academy Team.
              </p>
            </td>
          </tr>

          <tr>
            <td style="height: 30px;padding: 0;"></td>
          </tr>

          <tr>
            <td style="height: 10px;background-color: #2b1f68;padding: 0;"></td>
          </tr>        
        </table>
      </div>

    </center>
  </body>
</html>
  `;
};

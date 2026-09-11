using System;
using System.Data;
using System.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Net;
using System.Net.Mail;

public partial class System_Administrator_Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!this.IsPostBack)
        {
            try
            {
                HttpCookie mygoacookie1 = HttpContext.Current.Request.Cookies["mygoacookie1"];
                HttpCookie mygoacookie11 = HttpContext.Current.Request.Cookies["mygoacookie11"];
                if (mygoacookie1 != null && mygoacookie11 != null)
                {
                    TextBox1.Text = mygoacookie1.Value;
                    TextBox2.Text = mygoacookie11.Value;

                }
                else
                {

                }
            }
            catch
            {

            }
        }
    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        ValidateUserInfo(TextBox1.Text.Trim(), TextBox2.Text.Trim());
    }
    protected void ValidateUserInfo(string user, string pass)
    {
        string cnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection connection = new SqlConnection(cnString);
        string sql = "SELECT * FROM Login WHERE Username = @Email AND Password = @password";
        SqlCommand cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@Email", user);
        cmd.Parameters.AddWithValue("@password", pass);
        connection.Open();
        //DataTable dt = new DataTable();
        SqlDataAdapter ad = new SqlDataAdapter(cmd);
        DataSet dt = new DataSet();
        ad.Fill(dt, "login");
        if (dt.Tables[0].Rows.Count > 0)
        {

            HttpCookie mygoacookie1 = new HttpCookie("mygoacookie1");
            mygoacookie1.Value = TextBox1.Text;
            mygoacookie1.Expires = DateTime.Now.AddDays(30);
            HttpContext.Current.Response.Cookies.Add(mygoacookie1);

            HttpCookie mygoacookie11 = new HttpCookie("mygoacookie11");
            mygoacookie11.Value = TextBox2.Text;
            mygoacookie11.Expires = DateTime.Now.AddDays(30);
            HttpContext.Current.Response.Cookies.Add(mygoacookie11);

            Response.Redirect("Dashboard.aspx");
        }
        else
        {
            Response.Write("<script>alert('INVALID Username and Password, Try Again!')</script>");
        }
        connection.Close();
    }
}
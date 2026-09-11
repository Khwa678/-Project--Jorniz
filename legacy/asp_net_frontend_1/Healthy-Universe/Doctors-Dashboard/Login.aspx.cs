using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Drawing;

public partial class Login : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        failed.Style.Add("display", "none");
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {
            ValidateUserInfo(TextBox3.Text.Trim(), TextBox6.Text.Trim());
        }
        catch
        {
            failed.Style.Add("display", "block");
        }
    }
    protected void ValidateUserInfo(string user, string pass)
    {
        string cnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection connection = new SqlConnection(cnString);
        string sql = "SELECT * FROM Registrations WHERE Email = @Email AND Password = @Password";
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

            HttpCookie mygoacookie1x = new HttpCookie("mygoacookie1x");
            mygoacookie1x.Value = TextBox3.Text;
            mygoacookie1x.Expires = DateTime.Now.AddDays(30);
            HttpContext.Current.Response.Cookies.Add(mygoacookie1x);

            HttpCookie mygoacookie11x = new HttpCookie("mygoacookie11x");
            mygoacookie11x.Value = TextBox6.Text;
            mygoacookie11x.Expires = DateTime.Now.AddDays(30);
            HttpContext.Current.Response.Cookies.Add(mygoacookie11x);

            connection.Close();

            string status;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Registrations WHERE Email = @Email";
            using (SqlConnection connection1 = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection1);
                command.Parameters.Add("@Email", mygoacookie1x.Value);
                connection1.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                status = reader["Status"].ToString();
               

                reader.Close();
                connection1.Close();
            }

            if (status == "Pending")
            {
                Response.Redirect("Vendor-Panel/Default.aspx");
            }
            //else if (profile == "Incomplete")
            //{
            //    Response.Redirect("Vendor-Panel/Manage.aspx");
            //}
            else
            {
                Response.Redirect("Vendor-Panel/Account-Suspended.aspx");
              
            }
        }
        else
        {
            Response.Write("<script>alert('INVALID Email Address and Password, Try Again!')</script>");
            connection.Close();
        }
    }


}
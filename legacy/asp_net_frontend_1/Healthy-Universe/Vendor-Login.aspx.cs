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

public partial class Vendor_Login : System.Web.UI.Page
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
        string sql = "SELECT * FROM Sproviders WHERE Email = @Email AND Password = @password";
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
            mygoacookie1.Value = TextBox3.Text;
            mygoacookie1.Expires = DateTime.Now.AddDays(10);
            HttpContext.Current.Response.Cookies.Add(mygoacookie1);
           
            connection.Close();

            string status;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Sproviders WHERE Email = @Email";
            using (SqlConnection connection1 = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection1);
                command.Parameters.Add("@Email", mygoacookie1.Value);
                connection1.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                status = reader["Status"].ToString();
             
                reader.Close();
                connection1.Close();
            }

            if (status == "Inactive" || status == "Suspended" || status == "Rejected")
            {
                Response.Redirect("vendor-panel/Account-Suspended.aspx");
            }
            //else if (profile == "Incomplete")
            //{
            //    Response.Redirect("Extranet/Manage.aspx");
            //}
            else
            {
                Response.Redirect("vendor-panel/Default.aspx");
            }
        }
        else
        {
            Response.Write("<script>alert('INVALID Username and Password, Try Again!')</script>");
            connection.Close();
        }
    }

    protected void Button2_Click(object sender, EventArgs e)
    {
        Response.Redirect("Ereset.aspx");
    }
}

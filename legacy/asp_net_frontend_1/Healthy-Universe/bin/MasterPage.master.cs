using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Security;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Collections.Specialized;
using System.Text;
using System.Security.Cryptography;
using System.Net;
using System.Net.Mail;

public partial class MasterPage : System.Web.UI.MasterPage
{
    protected void Page_Load(object sender, EventArgs e)
    {

        error1.Style.Add("display", "none");
        error2.Style.Add("display", "none");
        error3.Style.Add("display", "none");
        error5.Style.Add("display", "none");
        success.Style.Add("display", "none");


        

        if (!this.IsPostBack)
        {


            //Repeater3.DataSource = GetData("Select * From Testtypes");
            //Repeater3.DataBind();

            BindData1();
            BindData2();

        }

        try
        {
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
            {
                notlogin.Style.Add("display", "block");
                alreadylogin.Style.Add("display", "none");
            }
            else
            {
                notlogin.Style.Add("display", "none");
                alreadylogin.Style.Add("display", "block");


                try
                {
                   
                    string email = string.Empty;
                    string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                    string str1 = " SELECT * FROM Customers WHERE Id = @Id";
                    using (SqlConnection connection = new SqlConnection(strConnString1))
                    {
                        //parametrized query to prevent SQL Injection
                        SqlCommand command = new SqlCommand(str1, connection);
                        command.Parameters.Add("@Id", returnCookie1.Value);
                        connection.Open();
                        SqlDataReader reader = command.ExecuteReader();
                        reader.Read();

                        email = reader["Email"].ToString();

                        Label2.Text = email;

                        reader.Close();
                        connection.Close();
                    }

                }
                catch
                {
                   
                }
            }
        }
        catch
        {

        }

       

    }
    protected string GetTitle(object obj)
    {
        return obj.ToString().Replace(' ', '-');
    }
    //protected void Repeater3_ItemDataBound(object sender, RepeaterItemEventArgs e)
    //{
    //    if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
    //    {
    //        string customerId = (e.Item.FindControl("hfCustomerId") as HiddenField).Value;
    //        Repeater rptOrders = e.Item.FindControl("rptOrders") as Repeater;
    //        rptOrders.DataSource = GetData(string.Format("SELECT * FROM Tests WHERE Categoryid='{0}'", customerId));
    //        rptOrders.DataBind();
    //    }
    //}
    protected void BindData1()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select Top (8) * From Subcategory ORDER BY Id DESC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater1.DataSource = ds.Tables[0];
        Repeater1.DataBind();
        conn.Close();
    }
    protected void BindData2()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select Top (8) * From Subcategory ORDER BY Id DESC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
       
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater2.DataSource = ds.Tables[0];
        Repeater2.DataBind();
        conn.Close();
    }
    //private static DataTable GetData(string query)
    //{
    //    string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //    using (SqlConnection con = new SqlConnection(constr))
    //    {
    //        using (SqlCommand cmd = new SqlCommand())
    //        {
    //            cmd.CommandText = query;
    //            using (SqlDataAdapter sda = new SqlDataAdapter())
    //            {
    //                cmd.Connection = con;
    //                sda.SelectCommand = cmd;
    //                using (DataSet ds = new DataSet())
    //                {
    //                    DataTable dt = new DataTable();
    //                    sda.Fill(dt);
    //                    return dt;
    //                }
    //            }
    //        }
    //    }
    //}
    protected void search1(object sender, EventArgs e)
    {
        string Title = TextBox1search.Text;

        if (Title == "" || Title == null)
        {
            Response.Redirect("Tests.aspx");
        }
        else
        {
            Response.Redirect("Tests.aspx?term=" + Title);
        }
    }
    protected void search2(object sender, EventArgs e)
    {
        string Title = TextBox2search.Text;

        if (Title == "" || Title == null)
        {
            Response.Redirect("Tests.aspx");
        }
        else
        {
            Response.Redirect("Tests.aspx?term=" + Title);
        }
    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        string str = "Select Id from Customers where Email= @EmailId AND Password=@Password";
        string strConnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        using (SqlConnection connection = new SqlConnection(strConnString))
        {
            //parametrized query to prevent SQL Injection
            SqlCommand command = new SqlCommand(str, connection);
            command.Parameters.AddWithValue("@EmailId", TextBox1l.Text);
            command.Parameters.AddWithValue("@Password", TextBox2l.Text);
            try
            {
                connection.Open();
                //reading data and writing to a label
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                string uid = reader["Id"].ToString();
                reader.Close();
                connection.Close();

                var response = HttpContext.Current.Response;
                response.Cookies.Remove("mydealloscookie2");

                HttpCookie mydealloscookie2 = new HttpCookie("mydealloscookie2");
                mydealloscookie2.Value = uid;
                mydealloscookie2.Expires = DateTime.Now.AddDays(2);
                HttpContext.Current.Response.Cookies.Add(mydealloscookie2);

                HttpCookie returnCookie = Request.Cookies["returnUrl"];
                if ((returnCookie == null) || string.IsNullOrEmpty(returnCookie.Value))
                {
                    Response.Redirect("My-Account.aspx");
                }
                else
                {
                    HttpCookie deleteCookie = new HttpCookie("returnUrl");
                    deleteCookie.Expires = DateTime.Now.AddDays(-1);
                    Response.Cookies.Add(deleteCookie);
                    Response.Redirect(returnCookie.Value);
                }

                TextBox1l.Text = string.Empty;
                TextBox2l.Text = string.Empty;




            }
            catch (Exception ex)
            {
                error1.Style.Add("display", "block");
                error2.Style.Add("display", "none");
                error3.Style.Add("display", "none");
                error5.Style.Add("display", "none");
            }
        }
    }
    protected void Button2_Click(object sender, EventArgs e)
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(constring);
        SqlCommand cmd = new SqlCommand("Select Email, Contact from Customers where Email=@Email OR Contact=@Contact", con);
        cmd.Parameters.AddWithValue("@Email", TextBox1s.Text);
        cmd.Parameters.AddWithValue("@Contact", TextBox2.Text);
        con.Open();
        SqlDataReader dr = cmd.ExecuteReader();
        if (dr.Read())
        {
            if (dr.HasRows == true)
            {
                con.Close();


                error1.Style.Add("display", "none");
                error2.Style.Add("display", "block");
                error3.Style.Add("display", "none");
                error5.Style.Add("display", "none");


            }
        }
        else
        {
            con.Close();
            try
            {
                string query = "Insert into Customers(Email,Password,Contact) values(@Email,@Password,@Contact);SELECT CAST(scope_identity() AS int);";
                using (SqlCommand command = new SqlCommand(query, con))
                {
                    command.Parameters.AddWithValue("@Password", TextBox2s.Text);
                    command.Parameters.AddWithValue("@Email", TextBox1s.Text);
                    command.Parameters.AddWithValue("@Contact", TextBox2.Text);
                    con.Open();
                    int NewId = Convert.ToInt32(command.ExecuteScalar());
                    con.Close();

                    var response = HttpContext.Current.Response;
                    response.Cookies.Remove("mydealloscookie2");

                    string dcid = NewId.ToString();
                    HttpCookie mydealloscookie2 = new HttpCookie("mydealloscookie2");
                    mydealloscookie2.Value = dcid;
                    mydealloscookie2.Expires = DateTime.Now.AddDays(2);
                    HttpContext.Current.Response.Cookies.Add(mydealloscookie2);

                    HttpCookie returnCookie = Request.Cookies["returnUrl"];
                    if ((returnCookie == null) || string.IsNullOrEmpty(returnCookie.Value))
                    {
                        Response.Redirect("My-Account.aspx");
                    }
                    else
                    {
                        HttpCookie deleteCookie = new HttpCookie("returnUrl");
                        deleteCookie.Expires = DateTime.Now.AddDays(-1);
                        Response.Cookies.Add(deleteCookie);
                        Response.Redirect(returnCookie.Value);
                    }

                    TextBox1s.Text = string.Empty;
                    TextBox2s.Text = string.Empty;
                    TextBox2.Text = string.Empty;
                }
            }
            catch
            {
                error1.Style.Add("display", "none");
                error2.Style.Add("display", "none");
                error3.Style.Add("display", "block");
                error5.Style.Add("display", "none");
            }
        }
    }
    protected void Button3_Click(object sender, EventArgs e)
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(constring);
        SqlCommand cmd = new SqlCommand("Select Email from Customers where Email= @Email", con);
        cmd.Parameters.AddWithValue("@Email", TextBox1f.Text);
        con.Open();
        SqlDataReader dr = cmd.ExecuteReader();
        if (dr.Read())
        {
            if (dr.HasRows == true)
            {
                con.Close();
                try
                {
                    string flink = "https://labprovider.com/Reset-Password.aspx?a1=" + HttpUtility.UrlEncode(Encrypt(TextBox1f.Text.Trim()));
                    string body = this.PopulateBody(flink);
                    this.SendHtmlFormattedEmail(TextBox1f.Text, "Reset Your Password | Account Recovery | Aksharadeep", body);
                    success.Style.Add("display", "block");
                }
                catch
                {
                    error1.Style.Add("display", "none");
                    error2.Style.Add("display", "none");
                    error3.Style.Add("display", "block");
                    error5.Style.Add("display", "none");
                }
            }
        }
        else
        {
            error1.Style.Add("display", "none");
            error2.Style.Add("display", "none");
            error3.Style.Add("display", "none");
            error5.Style.Add("display", "block");
        }




    }
    private string Encrypt(string clearText)
    {
        string EncryptionKey = "MAKV2SPBNI99212";
        byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
        using (Aes encryptor = Aes.Create())
        {
            Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
            encryptor.Key = pdb.GetBytes(32);
            encryptor.IV = pdb.GetBytes(16);
            using (MemoryStream ms = new MemoryStream())
            {
                using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    cs.Write(clearBytes, 0, clearBytes.Length);
                    cs.Close();
                }
                clearText = Convert.ToBase64String(ms.ToArray());
            }
        }
        return clearText;
    }
    private string PopulateBody(string url)
    {
        string body = string.Empty;
        using (StreamReader reader = new StreamReader(Server.MapPath("~/Reset.html")))
        {
            body = reader.ReadToEnd();
        }
        body = body.Replace("{Url}", url);
        return body;
    }
    private void SendHtmlFormattedEmail(string recepientEmail, string subject, string body)
    {
        using (MailMessage mailMessage = new MailMessage())
        {
            mailMessage.From = new MailAddress(ConfigurationManager.AppSettings["UserName"]);
            mailMessage.Subject = subject;
            mailMessage.Body = body;
            mailMessage.IsBodyHtml = true;
            mailMessage.To.Add(new MailAddress(recepientEmail));
            SmtpClient smtp = new SmtpClient();
            smtp.Host = ConfigurationManager.AppSettings["Host"];
            smtp.EnableSsl = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableSsl"]);
            System.Net.NetworkCredential NetworkCred = new System.Net.NetworkCredential();
            NetworkCred.UserName = ConfigurationManager.AppSettings["UserName"];
            NetworkCred.Password = ConfigurationManager.AppSettings["Password"];
            smtp.UseDefaultCredentials = true;
            smtp.Credentials = NetworkCred;
            smtp.Port = int.Parse(ConfigurationManager.AppSettings["Port"]);
            smtp.Send(mailMessage);
        }
    }
    protected void A1_Click(object sender, System.EventArgs e)
    {
        HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
        if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
        {
            Response.Redirect("Login.aspx");
        }
        else
        {
            Response.Cookies["mydealloscookie2"].Expires = DateTime.Now.AddDays(-1);
            Session.Abandon();
            Response.Redirect("Login.aspx");
        }
    }

  
    protected void Button5_Click(object sender, EventArgs e)
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(constring);
        SqlCommand cmd = new SqlCommand("Select Email from Newsletters where Email= @Email", con);
        cmd.Parameters.AddWithValue("@Email", TextBox1.Text);
        con.Open();
        SqlDataReader dr = cmd.ExecuteReader();
        if (dr.Read())
        {
            if (dr.HasRows == true)
            {
                con.Close();

                Response.Write("<script>alert('You have already subscribed to newsletter services.')</script>");

            }
        }
        else
        {
            con.Close();
            try
            {
                string query = "Insert into Newsletters(Email) values(@Email)";
                using (SqlCommand command = new SqlCommand(query, con))
                {
                    command.Parameters.AddWithValue("@Email", TextBox1.Text);
                    con.Open();
                    int NewId = Convert.ToInt32(command.ExecuteScalar());
                    con.Close();

                    

                    TextBox1.Text = string.Empty;

                    Response.Write("<script>alert('Great! Your subscription was successfull. Thanks for your interest in our Newsletter services.')</script>");
                }
            }
            catch
            {
                Response.Write("<script>alert('Sorry some error occoured, Please try again later!')</script>");
            }
        }
    }

    protected void Button6_Click(object sender, EventArgs e)
    {
        Response.Redirect("Login.aspx");
     }
}

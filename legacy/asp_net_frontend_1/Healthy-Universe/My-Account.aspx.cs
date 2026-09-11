using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Data;
using System.Data.Sql;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Specialized;
using System.Text;
using System.Web.UI.HtmlControls;
using System.Drawing;

public partial class My_Account : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        error3.Style.Add("display", "none");
        error4.Style.Add("display", "none");
        success.Style.Add("display", "none");

        failed.Style.Add("display", "none");
        success2.Style.Add("display", "none");
        logout.ServerClick += new EventHandler(logoutsystem);

        if (!this.IsPostBack)
        {

            try
            {
                string cartcount = Profile.SCart.Items.Count.ToString();
                if(Convert.ToInt32(cartcount) > 0)
                {
                    cartcontrol.Style.Add("display", "block");
                }
                else
                {
                    cartcontrol.Style.Add("display", "none");
                }
            }
            catch
            {
                cartcontrol.Style.Add("display", "none");
            }



            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
            {
                Response.Redirect("Login.aspx");
            }
            else
            {
                try
                {
                    string path = string.Empty;
                    string name = string.Empty;
                    string email = string.Empty;
                    string password = string.Empty;
                    string contact = string.Empty;

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

                        name = reader["Name"].ToString();
                        email = reader["Email"].ToString();
                        password = reader["Password"].ToString();
                        contact = reader["Contact"].ToString();

                        Label1.Text = email;
                        Label2.Text = password;
                        Label3.Text = name;
                        Label4.Text = contact;

                        TextBox1.Text = email;
                        TextBox2.Text = password;
                        TextBox3.Text = name;
                        TextBox9.Text = contact;

                        reader.Close();
                        connection.Close();
                    }

                    BindGrid();

                }
                catch
                {
                    Response.Redirect("Login.aspx");
                }
            }
        }
    }
    protected void logoutsystem(object sender, EventArgs e)
    {
        HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
        if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
        {
            Response.Redirect("Default.aspx");
        }
        else
        {
            Response.Cookies["mydealloscookie2"].Expires = DateTime.Now.AddDays(-1);
            Session.Abandon();
            Response.Redirect("Default.aspx");
        }
    }
    protected void TextBox3_TextChanged(object sender, EventArgs e)
    {
        Label3.Text = TextBox3.Text;
    }
    protected void TextBox1_TextChanged(object sender, EventArgs e)
    {
        Label1.Text = TextBox1.Text;
    }
    protected void TextBox2_TextChanged(object sender, EventArgs e)
    {
        Label2.Text = TextBox2.Text;
    }
    protected void Button2_Click(object sender, EventArgs e)
    {
        try
        {
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;

            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            SqlCommand cmd = new SqlCommand("Select Email, Contact from Customers where (Email=@Email OR Contact=@Contact) AND Id!=@Id", con);
            cmd.Parameters.AddWithValue("@Email", Label1.Text);
            cmd.Parameters.AddWithValue("@Contact", Label4.Text);
            cmd.Parameters.AddWithValue("@Id", returnCookie1.Value);
            con.Open();
            SqlDataReader dr = cmd.ExecuteReader();
            if (dr.Read())
            {
                if (dr.HasRows == true)
                {
                    con.Close();

                    error3.Style.Add("display", "none");
                    error4.Style.Add("display", "block");
                    TextBox2.Text = string.Empty;
                }
            }
            else
            {
                con.Close();

                using (SqlConnection con1 = new SqlConnection(constr))
                {
                    con1.Open();
                    SqlCommand cmd1 = new SqlCommand("update Customers set Name = @Name, Password = @Password, Email=@Email, Contact=@Contact WHERE Id=@Id", con1);
                    cmd1.Parameters.AddWithValue("@Id", returnCookie1.Value);
                    cmd1.Parameters.AddWithValue("@Name", Label3.Text);
                    cmd1.Parameters.AddWithValue("@Password", Label2.Text);
                    cmd1.Parameters.AddWithValue("@Email", Label1.Text);
                    cmd1.Parameters.AddWithValue("@Contact", Label4.Text);
                    cmd1.ExecuteNonQuery();
                    con1.Close();
                }

                TextBox1.Text = Label1.Text;
                TextBox2.Text = Label2.Text;
                TextBox3.Text = Label3.Text;
                TextBox9.Text = Label4.Text;

                error3.Style.Add("display", "none");
                success.Style.Add("display", "inline-block");

            }

        }
        catch
        {
            error3.Style.Add("display", "block");
            success.Style.Add("display", "none");
        }
    }
    protected void Button3_Click(object sender, EventArgs e)
    {
        
            Response.Redirect("My-Orders.aspx");

    }
    protected void grdImages_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
        string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);

        try
        {

            int imgId = Convert.ToInt32(grdImages.DataKeys[e.RowIndex].Value);
            SqlCommand cmd = new SqlCommand("delete from Addresses where Id=@Id", con);
            cmd.Parameters.AddWithValue("@Id", imgId);
            cmd.CommandType = CommandType.Text;
            con.Open();
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            BindGrid();
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            con.Close();
        }
    }
    protected void GridView1_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            string status = (e.Row.FindControl("lbltitle111") as Label).Text;
            if (status == "0")
            {

            }
            else if (status == "1")
            {

            }
            else if (status == "2")
            {

            }
        }
    }

    protected void BindGrid()
    {
        HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
        string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Addresses WHERE Customerid=@Customerid", con);
            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@Customerid", returnCookie1.Value);
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                grdImages.DataSource = dt;
                grdImages.DataBind();
            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();
            }
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt.Clear();
            dt.Dispose();
            adp.Dispose();
        }
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con2 = new SqlConnection(constring);
            string query = "Insert into Addresses(Faddress,Landmark,Area,City,Atype,Customerid,State,Areacode) values(@Faddress,@Landmark,@Area,@City,@Atype,@Customerid,@State,@Areacode);";
            using (SqlCommand command = new SqlCommand(query, con2))
            {

                command.Parameters.AddWithValue("@Faddress", TextBox4.Text);
                command.Parameters.AddWithValue("@Landmark", TextBox5.Text);
                command.Parameters.AddWithValue("@Area", TextBox6.Text);
                command.Parameters.AddWithValue("@City", TextBox7.Text);
                command.Parameters.AddWithValue("@Atype", DropDownList3.SelectedItem.Text);
                command.Parameters.AddWithValue("@Customerid", returnCookie1.Value);
                command.Parameters.AddWithValue("@State", TextBox8.Text);
                command.Parameters.AddWithValue("@Areacode", TextBox10.Text);
                con2.Open();
                command.ExecuteScalar();
                con2.Close();
            }

            TextBox4.Text = string.Empty;
            TextBox5.Text = string.Empty;
            TextBox6.Text = string.Empty;
            TextBox7.Text = string.Empty;
            TextBox8.Text = string.Empty;
            TextBox10.Text = string.Empty;

            DropDownList3.ClearSelection();


            failed.Style.Add("display", "none");
            success2.Style.Add("display", "block");
            BindGrid();

        }
        catch
        {
            failed.Style.Add("display", "block");
            success2.Style.Add("display", "none");
        }
    }

    protected void Button4_Click(object sender, EventArgs e)
    {
        Response.Redirect("Cart.aspx");

    }

    protected void TextBox9_TextChanged(object sender, EventArgs e)
    {
        Label4.Text = TextBox9.Text;
    }
}
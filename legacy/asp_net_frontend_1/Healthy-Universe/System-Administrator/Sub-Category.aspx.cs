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


public partial class System_Administrator_Sub_Category : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        failed.Style.Add("display", "none");
        success.Style.Add("display", "none");


        if (!this.IsPostBack)
        {
            BindGrid2();

            DropDownList1.Enabled = false;
            DropDownList1.Items.Insert(0, new ListItem("--Select Category--", "0"));
            DropDownList2.Enabled = false;
            DropDownList2.Items.Insert(0, new ListItem("--Select Category--", "0"));

            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Parentcategory"))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList4.DataSource = cmd.ExecuteReader();
                    DropDownList4.DataTextField = "Title";
                    DropDownList4.DataValueField = "Id";
                    DropDownList4.DataBind();
                    con.Close();
                }
            }
            DropDownList4.Items.Insert(0, new ListItem("--Select Department--", "0"));

            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Parentcategory"))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList3.DataSource = cmd.ExecuteReader();
                    DropDownList3.DataTextField = "Title";
                    DropDownList3.DataValueField = "Id";
                    DropDownList3.DataBind();
                    con.Close();
                }
            }
            DropDownList3.Items.Insert(0, new ListItem("--Select Department--", "0"));

        }
    }

    protected void BindGrid2()
    {

        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Lastcategory", con);
            adp.SelectCommand = cmd;
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                GridView1.DataSource = dt;
                GridView1.DataBind();
                emptylist.Style.Add("display", "none");
            }
            else
            {
                GridView1.DataSource = null;
                GridView1.DataBind();
                emptylist.Style.Add("display", "block");
            }
        }
        catch (Exception ex)
        {
            //ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt.Clear();
            dt.Dispose();
            adp.Dispose();
        }
    }
    protected void BindGrid3()
    {

        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from subcategory where Id=@Id", con);
            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@ID", "Subcategoryid");
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                GridView1.DataSource = dt;
                GridView1.DataBind();
                emptylist.Style.Add("display", "none");
            }
            else
            {
                GridView1.DataSource = null;
                GridView1.DataBind();
                emptylist.Style.Add("display", "block");
            }
        }
        catch (Exception ex)
        {
            //ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt.Clear();
            dt.Dispose();
            adp.Dispose();
        }
    }
    protected void Button5_Click(object sender, System.EventArgs e)
    {
        try
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            SqlCommand cmd = new SqlCommand("Select Title from Lastcategory where Title=@Title AND Subcategoryid=@Subcategoryid", con);
            cmd.Parameters.AddWithValue("@Title", this.TextBox2.Text);
            cmd.Parameters.Add("@Subcategoryid", DropDownList1.SelectedItem.Value);
            con.Open();
            SqlDataReader dr = cmd.ExecuteReader();
            if (dr.Read())
            {
                if (dr.HasRows == true)
                {
                    Response.Write(@"<script language='javascript'>alert('Sub-Category already Exists.')</script>");
                    con.Close();
                }
            }
            else
            {
                con.Close();

                if (DropDownList1.SelectedItem.Value == "0")
                {
                    Response.Write(@"<script language='javascript'>alert('Please check & verify the Category selection.')</script>");
                }
                else
                {

                    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                    SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
                    SqlCommand cmd1 = new SqlCommand("Insert into Lastcategory (Title,Subcategoryid) values (@Title,@Subcategoryid)", con1);
                    cmd1.Parameters.AddWithValue("@Title", TextBox2.Text);
                    cmd1.Parameters.AddWithValue("@Subcategoryid", DropDownList1.SelectedItem.Value);
                    if (con1.State == ConnectionState.Closed)
                    {
                        con1.Open();
                    }
                    cmd1.Connection = con1;
                    cmd1.ExecuteNonQuery();
                    cmd1.Dispose();
                    con1.Close();
                    BindGrid2();
                    TextBox2.Text = string.Empty;
                    DropDownList1.ClearSelection();
                }


            }
            success.Style.Add("display", "block");

        }
        catch
        {
            failed.Style.Add("display", "block");
        }
    }
    protected void GridView1_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
        try
        {
            //Get the Image_Id from the DataKeyNames
            int imgId = Convert.ToInt32(GridView1.DataKeys[e.RowIndex].Value);
            SqlCommand cmd = new SqlCommand("delete from Lastcategory where Id=@Id", con);
            cmd.Parameters.AddWithValue("@Id", imgId);
            cmd.CommandType = CommandType.Text;
            con.Open();
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            BindGrid2();
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
    protected void GridView1_RowEditing(object sender, GridViewEditEventArgs e)
    {
        GridView1.EditIndex = e.NewEditIndex;
        this.BindGrid2();
    }
    protected void GridView1_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
    {
        GridView1.EditIndex = -1;
        this.BindGrid2();
    }
    protected void GridView1_RowUpdating(object sender, GridViewUpdateEventArgs e)
    {
        try
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                int id = Convert.ToInt32(GridView1.DataKeys[e.RowIndex].Value.ToString());

                TextBox txt1 = (TextBox)GridView1.Rows[e.RowIndex].FindControl("txt1");

                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Lastcategory set Title=@Title where Id=" + id, con1);
                cmd1.Parameters.AddWithValue("@Title", txt1.Text);
                cmd1.ExecuteNonQuery();
                con1.Close();

                GridView1.EditIndex = -1;
                BindGrid2();
            }
        }
        catch
        {
        }
    }
    protected void DropDownList2_SelectedIndexChanged(object sender, System.EventArgs e)
    {
        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Lastcategory WHERE Subcategoryid=@Subcategoryid", con);
            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@Subcategoryid", DropDownList2.SelectedItem.Value);
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                GridView1.DataSource = dt;
                GridView1.DataBind();
            }
            else
            {
                GridView1.DataSource = null;
                GridView1.DataBind();
            }
        }
        catch (Exception ex)
        {
            //ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt.Clear();
            dt.Dispose();
            adp.Dispose();
        }
    }

    protected void DropDownList3_SelectedIndexChanged(object sender, EventArgs e)
    {
        DropDownList1.Enabled = true;
        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        using (SqlConnection con = new SqlConnection(constr))
        {
            using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Subcategory WHERE Categoryid=@Categoryid"))
            {
                cmd.Parameters.Add("@Categoryid", DropDownList3.SelectedItem.Value);
                cmd.CommandType = CommandType.Text;
                cmd.Connection = con;
                con.Open();
                DropDownList1.DataSource = cmd.ExecuteReader();
                DropDownList1.DataTextField = "Title";
                DropDownList1.DataValueField = "Id";
                DropDownList1.DataBind();
                con.Close();
            }
        }
        DropDownList1.Items.Insert(0, new ListItem("--Select Category--", "0"));
    }

    protected void DropDownList4_SelectedIndexChanged(object sender, EventArgs e)
    {
        DropDownList2.Enabled = true;
        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        using (SqlConnection con = new SqlConnection(constr))
        {
            using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Subcategory WHERE Categoryid=@Categoryid"))
            {
                cmd.Parameters.Add("@Categoryid", DropDownList4.SelectedItem.Value);
                cmd.CommandType = CommandType.Text;
                cmd.Connection = con;
                con.Open();
                DropDownList2.DataSource = cmd.ExecuteReader();
                DropDownList2.DataTextField = "Title";
                DropDownList2.DataValueField = "Id";
                DropDownList2.DataBind();
                con.Close();
            }
        }
        DropDownList2.Items.Insert(0, new ListItem("--Select Category--", "0"));
    }

    protected void GridView1_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        GridView1.PageIndex = e.NewPageIndex;
        this.BindGrid2();
    }

    protected void GridView1_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            string strConnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            GridViewRow Row = e.Row;

        
            string Subcategory = (Row.FindControl("lbl11") as Label).Text;
            string str1x = " SELECT * FROM Subcategory WHERE Id = @Id";
            using (SqlConnection connection = new SqlConnection(strConnString))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1x, connection);
                command.Parameters.Add("@Id", Subcategory);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                (Row.FindControl("Label2") as Label).Text = reader["Title"].ToString();

                reader.Close();
                connection.Close();
            }

        }
    }
}
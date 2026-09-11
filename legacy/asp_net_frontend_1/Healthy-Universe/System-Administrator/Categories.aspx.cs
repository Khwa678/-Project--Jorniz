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

public partial class System_Administrator_Categories : System.Web.UI.Page
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
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Parentcategory"))
                {
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
            DropDownList1.Items.Insert(0, new ListItem("--Select Department--", "0"));

            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Parentcategory"))
                {
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
            DropDownList2.Items.Insert(0, new ListItem("--Select Department--", "0"));
        }
    }
   
    protected void BindGrid2()
    {

        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Subcategory", con);
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
    protected void Button5_Click(object sender, System.EventArgs e)
    {
        try
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            SqlCommand cmd = new SqlCommand("Select Title from Subcategory where Title=@Title", con);
            cmd.Parameters.AddWithValue("@Title", this.TextBox2.Text);
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
                    Response.Write(@"<script language='javascript'>alert('Please check & verify the Department selection.')</script>");
                }
                else
                {
                    string fileName1;
                    string path1 = string.Empty;
                    if (FileUpload1.HasFile)
                    {
                        System.Drawing.Image img = System.Drawing.Image.FromStream(FileUpload1.PostedFile.InputStream);

                        int largestDimension = Math.Max(img.Height, img.Width);
                        Size squareSize = new Size(largestDimension, largestDimension);
                        Bitmap squareImage = new Bitmap(squareSize.Width, squareSize.Height);
                        using (Graphics graphics = Graphics.FromImage(squareImage))
                        {
                            graphics.FillRectangle(Brushes.White, 0, 0, squareSize.Width, squareSize.Height);
                            graphics.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
                            graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                            graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;

                            graphics.DrawImage(img, (squareSize.Width / 2) - (img.Width / 2), (squareSize.Height / 2) - (img.Height / 2), img.Width, img.Height);
                        }


                        fileName1 = System.DateTime.Now.ToString("ddMMyyhhmmss") + "t1.jpeg";
                        path1 = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName1;
                        squareImage.Save(Server.MapPath("Uploads/" + fileName1), System.Drawing.Imaging.ImageFormat.Jpeg);


                    }
                    else
                    {
                        path1 = "https://healthyuniverse.co.in/System-Administrator/testpic.jpg";
                    }


                    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                    SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
                    SqlCommand cmd1 = new SqlCommand("Insert into Subcategory (Title,Categoryid,Path1) values (@Title,@Categoryid,@Path1)", con1);
                    cmd1.Parameters.AddWithValue("@Title", TextBox2.Text);
                    cmd1.Parameters.AddWithValue("@Categoryid", DropDownList1.SelectedItem.Value);
                    cmd1.Parameters.AddWithValue("@Path1", path1);
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
                    FileUpload1.Attributes.Clear();
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
            SqlCommand cmd = new SqlCommand("delete from Subcategory where Id=@Id", con);
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

                FileUpload file = (FileUpload)GridView1.Rows[e.RowIndex].FindControl("fuEditFile1");

                string fileName = string.Empty;

                string newipath;
                fileName = Guid.NewGuid() + file.FileName;
                file.SaveAs(Server.MapPath("Uploads/") + fileName);
                newipath = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName;

                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Subcategory set Title=@Title, Path1=@Path1 where Id=" + id, con1);
                cmd1.Parameters.AddWithValue("@Title", txt1.Text);
                cmd1.Parameters.AddWithValue("@Path1", newipath);
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
            SqlCommand cmd = new SqlCommand("select * from Subcategory WHERE Categoryid=@Categoryid", con);
            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@Categoryid", DropDownList2.SelectedItem.Value);
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

    protected void GridView1_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        GridView1.PageIndex = e.NewPageIndex;
        this.BindGrid2();
    }
}
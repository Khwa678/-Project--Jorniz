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


public partial class System_Administrator_Departments : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        success.Style.Add("display", "none");
        failed.Style.Add("display", "none");

        if (!this.IsPostBack)
        {
            BindGrid();
            
        }
    }
    protected void BindGrid()
    {

        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Parentcategory", con);
            adp.SelectCommand = cmd;
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                grdImages.DataSource = dt;
                grdImages.DataBind();
                emptylist.Style.Add("display", "none");
            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();
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
    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            SqlCommand cmd = new SqlCommand("Select Title from Parentcategory where Title=@Title", con);
            cmd.Parameters.AddWithValue("@Title", this.TextBox1.Text);
            con.Open();
            SqlDataReader dr = cmd.ExecuteReader();
            if (dr.Read())
            {
                if (dr.HasRows == true)
                {
                    Response.Write(@"<script language='javascript'>alert('Category already Exists.')</script>");
                    con.Close();
                }
            }
            else
            {
                con.Close();

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
                SqlCommand cmd1 = new SqlCommand("Insert into Parentcategory (Title,Path1) values (@Title,@Path1)", con1);
                cmd1.Parameters.AddWithValue("@Title", TextBox1.Text);
                cmd1.Parameters.AddWithValue("@Path1", path1);

                if (con1.State == ConnectionState.Closed)
                {
                    con1.Open();
                }
                cmd1.Connection = con1;
                cmd1.ExecuteNonQuery();
                cmd1.Dispose();
                con1.Close();
                BindGrid();
                TextBox1.Text = string.Empty;
                FileUpload1.Attributes.Clear();

                success.Style.Add("display", "block");


            }
        }
        catch
        {
            failed.Style.Add("display", "block");
        }
    }
    protected void grdImages_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
        try
        {
            int imgId = Convert.ToInt32(grdImages.DataKeys[e.RowIndex].Value);

            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con1 = new SqlConnection(constring);
            SqlCommand cmd1 = new SqlCommand("SELECT COUNT(*) FROM Subcategory WHERE Categoryid=@Categoryid", con1);
            cmd1.Parameters.AddWithValue("@Categoryid", imgId);
            if (con1.State == ConnectionState.Closed)
            {
                con1.Open();
            }
            cmd1.Connection = con1;
            Int32 count = (Int32)cmd1.ExecuteScalar();
            cmd1.Dispose();
            con1.Close();

            if (count > 0)
            {
                Response.Write(@"<script language='javascript'>alert('This Department has active Categories. Please Remove all Categories first.')</script>");
            }
            else
            {
                SqlCommand cmd = new SqlCommand("delete from Parentcategory where Id=@Id", con);
                cmd.Parameters.AddWithValue("@Id", imgId);
                cmd.CommandType = CommandType.Text;
                con.Open();
                cmd.ExecuteNonQuery();
                cmd.Dispose();
                BindGrid();

               
            }

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
    protected void grdImages_RowEditing(object sender, GridViewEditEventArgs e)
    {
        grdImages.EditIndex = e.NewEditIndex;
        this.BindGrid();
    }
    protected void grdImages_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
    {
        grdImages.EditIndex = -1;
        this.BindGrid();
    }
    protected void grdImages_RowUpdating(object sender, GridViewUpdateEventArgs e)
    {
        try
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                int id = Convert.ToInt32(grdImages.DataKeys[e.RowIndex].Value.ToString());

                TextBox txt1 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt1");

                FileUpload file = (FileUpload)grdImages.Rows[e.RowIndex].FindControl("fuEditFile");
                string fileName = string.Empty;

                string newipath;
                fileName = Guid.NewGuid() + file.FileName;
                file.SaveAs(Server.MapPath("Uploads/") + fileName);
                newipath = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName;

                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Parentcategory set Title=@Title, Path1=@Path1 where Id=" + id, con1);
                cmd1.Parameters.AddWithValue("@Title", txt1.Text);
                cmd1.Parameters.AddWithValue("@Path1", newipath);
                cmd1.ExecuteNonQuery();
                con1.Close();

                grdImages.EditIndex = -1;
                BindGrid();
            }


        }
        catch
        {


        }
    }
   
}
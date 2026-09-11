using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

public partial class System_Administrator_testing : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            ViewState["Filter"] = "ALL";
            DataTable dt = BindGridView();
            TableCell tableCell = GridView1.HeaderRow.Cells[0];
            Image img = new Image();
            img.ImageUrl = "~/Images/asc.png";
            tableCell.Controls.Add(new LiteralControl("&nbsp;"));
            tableCell.Controls.Add(img);
            ViewState["tables"] = dt;
        }
    }

    private DataTable BindGridView()
    {
        DataTable dt = new DataTable();
        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        string query = "SELECT * FROM Products";
        using (SqlConnection con = new SqlConnection(constr))
        {
            using (SqlCommand cmd = new SqlCommand())
            {
                if (ViewState["Filter"].ToString() == "ALL")
                {

                }
                else if (ViewState["Filter"].ToString() == "10")
                {
                    query = "SELECT TOP 3 * FROM Products";
                }
                else
                {
                    query += " WHERE Title = @Filter";
                    cmd.Parameters.AddWithValue("@Filter", ViewState["Filter"].ToString());
                }

                cmd.CommandText = query;
                cmd.Connection = con;
                using (SqlDataAdapter sda = new SqlDataAdapter())
                {
                    sda.SelectCommand = cmd;
                    sda.Fill(dt);
                    GridView1.DataSource = dt;
                    GridView1.DataBind();
                }
            }
        }

        DropDownList section = (DropDownList)GridView1.HeaderRow.FindControl("section");
        this.BindCountryList(section);

        return dt;
    }

    protected void GridView1_Sorting(object sender, GridViewSortEventArgs e)
    {
        string SortDir = string.Empty;
        DataTable dt = new DataTable();
        dt = ViewState["tables"] as DataTable;
        if (dir == SortDirection.Ascending)
        {
            dir = SortDirection.Descending;
            SortDir = "Desc";
        }
        else
        {
            dir = SortDirection.Ascending;
            SortDir = "Asc";
        }
        DataView sortedView = new DataView(dt);
        sortedView.Sort = e.SortExpression + " " + SortDir;
        GridView1.DataSource = sortedView;
        GridView1.DataBind();
        DropDownList section = (DropDownList)GridView1.HeaderRow.FindControl("section");
        this.BindCountryList(section);
        for (int i = 0; i < GridView1.Columns.Count; i++)
        {
            if (GridView1.HeaderRow.Cells[i].Controls[0].GetType().Name == "DataControlLinkButton")
            {
                string lbText = ((LinkButton)GridView1.HeaderRow.Cells[i].Controls[0]).Text;
                if (lbText == e.SortExpression)
                {
                    TableCell tableCell = GridView1.HeaderRow.Cells[i];
                    Image img = new Image();
                    img.ImageUrl = (SortDir == "Asc") ? "~/Images/asc.png" : "~/Images/desc.png";
                    tableCell.Controls.Add(new LiteralControl("&nbsp;"));
                    tableCell.Controls.Add(img);
                }
            }
        }
    }

    public SortDirection dir
    {
        get
        {
            if (ViewState["dirState"] == null)
            {
                ViewState["dirState"] = SortDirection.Ascending;
            }
            return (SortDirection)ViewState["dirState"];
        }
        set
        {
            ViewState["dirState"] = value;
        }
    }

    protected void OnPaging(object sender, GridViewPageEventArgs e)
    {
        GridView1.PageIndex = e.NewPageIndex;
        BindGridView();
        TableCell tableCell = GridView1.HeaderRow.Cells[0];
        Image img = new Image();
        img.ImageUrl = "~/Images/asc.png";
        tableCell.Controls.Add(new LiteralControl("&nbsp;"));
        tableCell.Controls.Add(img);
    }

    protected void DeptChanged(object sender, EventArgs e)
    {
        DropDownList ddlCountry = (DropDownList)sender;
        ViewState["Filter"] = ddlCountry.SelectedValue;
        this.BindGridView();
        TableCell tableCell = GridView1.HeaderRow.Cells[0];
        Image img = new Image();
        img.ImageUrl = "~/Images/asc.png";
        tableCell.Controls.Add(new LiteralControl("&nbsp;"));
        tableCell.Controls.Add(img);
    }

    private void BindCountryList(DropDownList Dept)
    {
        String strConnString = System.Configuration.ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(strConnString);
        SqlDataAdapter sda = new SqlDataAdapter();
        SqlCommand cmd = new SqlCommand("SELECT DISTINCT Title FROM Products");
        cmd.Connection = con;
        con.Open();
        Dept.DataSource = cmd.ExecuteReader();
        Dept.DataTextField = "Title";
        Dept.DataValueField = "Title";
        Dept.DataBind();
        con.Close();
        Dept.Items.FindByValue(ViewState["Filter"].ToString()).Selected = true;
    }
}
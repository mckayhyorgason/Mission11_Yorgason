using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Mission11_Yorgason.Models;

[Index("BookId", IsUnique = true)]
public partial class Book
{
    [Key]
    [Column("BookID")]
    public int BookId { get; set; }

    public string Title { get; set; } = null!;

    public string Author { get; set; } = null!;

    public string Publisher { get; set; } = null!;

    [Column("ISBN")]
    public string Isbn { get; set; } = null!;

    public string Classification { get; set; } = null!;

    public string Category { get; set; } = null!;

    public int PageCount { get; set; }

    public double Price { get; set; }
}

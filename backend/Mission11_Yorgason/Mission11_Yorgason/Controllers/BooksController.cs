using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mission11_Yorgason.Models;

namespace Mission11_Yorgason.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BooksContext _context;

    public BooksController(BooksContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Book>>> GetBooks(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 0,
        [FromQuery] bool sortByTitle = false,
        [FromQuery] string? category = null)
    {
        IQueryable<Book> query = _context.Books.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(b => b.Category == category);
        }

        if (sortByTitle)
        {
            query = query.OrderBy(b => b.Title);
        }

        if (pageSize > 0)
        {
            if (pageNumber < 1)
            {
                pageNumber = 1;
            }

            var totalCount = await query.CountAsync();
            Response.Headers.Append("X-Total-Count", totalCount.ToString());

            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
        }

        var books = await query.ToListAsync();
        return Ok(books);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _context.Books
            .AsNoTracking()
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }
}

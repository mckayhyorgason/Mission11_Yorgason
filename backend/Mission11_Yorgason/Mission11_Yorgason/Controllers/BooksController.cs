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
        [FromQuery] string? category = null,
        [FromQuery] string[]? categories = null)
    {
        IQueryable<Book> query = _context.Books.AsNoTracking();

        var categoryFilters = categories?
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => c.Trim())
            .Distinct()
            .ToArray();

        if (categoryFilters is { Length: > 0 })
        {
            query = query.Where(b => categoryFilters.Contains(b.Category));
        }
        else if (!string.IsNullOrWhiteSpace(category))
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

    [HttpPost]
    public async Task<ActionResult<Book>> CreateBook([FromBody] Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return Created($"/api/books/{book.BookId}", book);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
    {
        if (id != book.BookId)
        {
            return BadRequest("Book ID mismatch.");
        }

        var existing = await _context.Books.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Title = book.Title;
        existing.Author = book.Author;
        existing.Publisher = book.Publisher;
        existing.Isbn = book.Isbn;
        existing.Classification = book.Classification;
        existing.Category = book.Category;
        existing.PageCount = book.PageCount;
        existing.Price = book.Price;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var existing = await _context.Books.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        _context.Books.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

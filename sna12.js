function checkValid() {
    var input = document.getElementById("nhapngaysinh");
    var inputValue = input.value.trim();
    
    if (inputValue === "") {
        alert("Vui lòng nhập ngày sinh!");
        return;
    }

    // Chỉ chấp nhận duy nhất một mật khẩu: 22/12/2006
    if (inputValue === "22/12/2006") {
        
        // Đóng modal
        $('#modalHoiNgaySinh').modal('hide');
        
        // Tạo overlay countdown
        var countdownHTML = `
            <div id="countdownOverlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,95);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;color:white;">
                <h1 style="font-size:5rem;margin:0;animation:pulse 1s infinite;">10</h1>
                <p style="font-size:1.5rem;margin-top:20px;opacity:0.8;">Chuẩn bị đón điều bất ngờ nào... ❤️</p>
            </div>`;
        
        $('body').append(countdownHTML);
        
        var count = 10;
        var countdownElement = $('#countdownOverlay h1');
        
        var timer = setInterval(function() {
            count--;
            countdownElement.text(count);
            
            if (count <= 0) {
                clearInterval(timer);
                $('#countdownOverlay').fadeOut(800, function() {
                    // Chuyển thẳng đến trang chính mà không hiển thị ASCII
                    window.location.href = "thoinen.html";
                });
            }
        }, 1000);
        
    } else {
        alert("Mật khẩu không chính xác!");
    }
}

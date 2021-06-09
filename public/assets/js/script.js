const photo = document.getElementById("product-image");

photo.addEventListener("change", function (e) {
	const src = URL.createObjectURL(e.target.files[0]);
	const previewImage = document.getElementById("photoimg");
	previewImage.src = src;
	previewImage.style.width = "200px";
	previewImage.style.height = "200px";
	document.getElementById("filename").innerText = e.target.files[0].name;
});

// * CKEDITOR
ClassicEditor.create(document.querySelector("#description")).catch((error) => {
	console.error(error);
});
setTimeout(() => {
	document.querySelector(".ck-label").innerHTML = "";
}, 1000);

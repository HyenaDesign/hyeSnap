document.addEventListener('DOMContentLoaded', async function() {
    const takePhotoButton = document.getElementById('take-photo');
    const resultsDiv = document.getElementById('results');

    takePhotoButton.addEventListener('click', async function() {
        const image = await takePhoto();
        const classifier = await loadMobileNet();

        const result = await classifyImage(image, classifier);
        displayResults(result);
    });

    async function takePhoto() {
        return new Promise((resolve, reject) => {
            const handleSuccess = function(stream) {
                const video = document.createElement('video');
                video.srcObject = stream;
                document.body.appendChild(video);
                video.play();

                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');

                video.addEventListener('loadedmetadata', function() {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const photo = new Image();
                    photo.src = canvas.toDataURL('image/jpeg');
                    resolve(photo);
                    stream.getTracks().forEach(track => track.stop());
                    document.body.removeChild(video);
                    document.body.removeChild(canvas);
                });
            };

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(handleSuccess)
                .catch(error => reject(error));
        });
    }

    async function loadMobileNet() {
        const model = await mobilenet.load();
        return model;
    }

    async function classifyImage(image, classifier) {
        const predictions = await classifier.classify(image);
        return predictions;
    }

    function displayResults(results) {
        resultsDiv.innerHTML = '';
        results.forEach(prediction => {
            const p = document.createElement('p');
            p.textContent = `${prediction.className}: ${prediction.probability.toFixed(4)}`;
            resultsDiv.appendChild(p);
        });
    }
});
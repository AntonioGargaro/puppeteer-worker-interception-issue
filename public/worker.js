
new Promise((resolve, reject) => {
    // Initialise XML request
    const xhr = new XMLHttpRequest()

    // Register response callbacks
    xhr.onload = (function () {
        const statusCode = xhr.status

        if (statusCode >= 400) {
            const errorMsg =
                xhr.responseType === 'text' || xhr.responseType === ''
                    ? xhr.responseText
                    : "Couldn't access response text"

            reject(
                `Failed ajax request. Status code was ${xhr.status}. ${errorMsg}`,
            )
        } else {
            resolve(xhr.responseText)
        }
    })

    // Reject with an error in case of unknown error or timeout
    xhr.onerror = (() =>
        reject(new Error('Failed ajax request. Unknown error'))
    )
    xhr.ontimeout = (() =>
        reject(new Error('Failed ajax request. Timed out'))
    )

    // Setup the request, the final (optional parameter) indicates an async request
    xhr.open('GET', 'http://localhost:3000/test.txt', true)

    xhr.setRequestHeader('content-type', 'text/plain')

    xhr.send(null)
})
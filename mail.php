<?php
// Get the origin from the request headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? ''; // Add null coalescing operator for safety

// List of allowed domains (comma-separated)
$allowedDomains = "http://localhost, https://karthi-email-builder.netlify.app";

// Check if the requesting domain is in the list of allowed domains
if (in_array($origin, explode(", ", $allowedDomains))) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Added POST method here

    // Handle preflight request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Respond to preflight request
        exit(0);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get customer email from POST request
        $mailto = $_POST['mailto'] ?? 'devkarthikeyan214@gmail.com';
        // Get customer name from POST request
        $getSubject = $_POST['subject'] ?? 'Test Email From Karthi Email Builder';
        // Get text message from POST request
        $msg = $_POST['message'] ?? '';

        if (!empty($msg)) {
            $to = $mailto;
            $subject = $getSubject;
            $message = $msg;

            // Additional headers
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= 'From: devkarthikeyan214@gmail.com' . "\r\n";
            $headers .= 'Reply-To: devkarthikeyan214@gmail.com' . "\r\n";
            $headers .= 'X-Mailer: PHP/' . phpversion();

            // Send email
            if (mail($to, $subject, $message, $headers)) {
                echo json_encode(['success' => 'Email sent successfully to ' . $mailto]);
            } else {
                echo json_encode(['error' => 'Failed to send email']);
            }
        } else {
            echo json_encode(['error' => 'Message cannot be empty']);
        }
    }
} else {
    echo json_encode(['error' => 'You are not allowed']);
}

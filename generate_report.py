import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch

def add_page_number(canvas, doc):
    page_num = canvas.getPageNumber()
    text = str(page_num)
    canvas.saveState()
    canvas.setFont('Times-Roman', 12)
    # Bottom middle
    canvas.drawCentredString(A4[0] / 2.0, 0.5 * inch, text)
    canvas.restoreState()

def generate_pdf():
    # 7) Margins: Top, Bottom, Right = 1 inch, Left = 1.25 inch
    left_margin = 1.25 * inch
    right_margin = 1.0 * inch
    top_margin = 1.0 * inch
    bottom_margin = 1.0 * inch

    doc = SimpleDocTemplate(
        "Seminar_Report.pdf",
        pagesize=A4,
        rightMargin=right_margin,
        leftMargin=left_margin,
        topMargin=top_margin,
        bottomMargin=bottom_margin
    )

    styles = getSampleStyleSheet()

    # 2) Font: Times New Roman. Size 12 for normal text.
    # 4) Justified throughout the report except headings
    # 5) Line spacing 1.5 for the entire report (12pt * 1.5 = 18pt leading)
    normal_style = ParagraphStyle(
        name='NormalJustified',
        fontName='Times-Roman',
        fontSize=12,
        leading=18,
        alignment=TA_JUSTIFY,
        spaceAfter=12
    )

    # 2) Font: Times New Roman. Size 14 for headings.
    # 3) Headings should be in bold.
    heading_style = ParagraphStyle(
        name='HeadingBold',
        fontName='Times-Bold',
        fontSize=14,
        leading=21,
        alignment=TA_LEFT,
        spaceAfter=18
    )
    
    title_style = ParagraphStyle(
        name='TitleStyle',
        fontName='Times-Bold',
        fontSize=16,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=24
    )

    story = []

    # Title
    story.append(Paragraph("Seminar Report: DeepScan - Cybersecurity Analysis Terminal", title_style))
    story.append(Spacer(1, 0.5 * inch))

    content = [
        ("Chapter-1: Introduction", 
         "Cybersecurity threats are evolving at an unprecedented rate, necessitating advanced, intuitive, and accessible tools for analyzing potential malware, phishing attempts, and system vulnerabilities. DeepScan is a web-based cybersecurity analysis terminal designed to address this critical need. It enables users to seamlessly scan files, directories, URLs, and cryptographic hashes against a mock threat intelligence engine. Unlike traditional security tools that often feature clinical and utilitarian interfaces, DeepScan leverages a premium, high-tech cyberpunk visual aesthetic. This design philosophy not only enhances the user experience but also gamifies the process of threat analysis, making it more engaging. By combining robust frontend engineering with dynamic visualizations, DeepScan provides users with immediate, intelligible feedback regarding the safety of their digital assets. The primary objective of this project is to demonstrate the integration of modern web technologies, specifically Next.js and React, in creating a responsive, secure, and visually striking application capable of simulating complex backend security operations."),
        
        ("Chapter-2: System Architecture", 
         "The DeepScan project is built upon a modern, serverless architecture utilizing the Next.js App Router framework. This architectural choice provides significant advantages in terms of performance, routing efficiency, and developer experience. The frontend is developed using React 19 and TypeScript, ensuring type safety and robust component state management. The application is entirely component-driven, breaking down the user interface into reusable modules such as the File Uploader, Results Dashboard, and Scan History. The backend infrastructure is handled by Next.js Route Handlers, which serve as serverless API endpoints. When a user submits a file or URL, the frontend communicates asynchronously with the /api/scan endpoint via POST requests. This backend API is responsible for processing the payload, calculating necessary cryptographic hashes using the native Node.js crypto module, and interfacing with the simulated threat intelligence engine. The architecture ensures a strict separation of concerns, where the client handles presentation and user interaction, while the serverless backend securely manages logic and data processing."),
        
        ("Chapter-3: UI/UX Design and Aesthetic", 
         "A defining characteristic of the DeepScan project is its distinctive user interface and user experience design. The application adopts a cyberpunk aesthetic, characterized by a dark mode terminal layout, neon color palettes predominantly cyan, magenta, and warning red and monospace typography utilizing the Geist font family. This design approach is highly intentional, aiming to simulate the environment of an advanced cybersecurity workstation. Extensive use of vanilla CSS and CSS Modules allows for complex visual effects without over-reliance on heavy CSS frameworks. Key visual components include animated radar sweeps during the scanning process and dynamic progress bars that provide continuous visual feedback. Furthermore, the application employs dynamic CSS glitch animations. When the system detects a High risk threat, the interface visually destabilizes, using keyframe animations and text shadows to create a jarring glitch effect that immediately alerts the user to the severity of the danger."),
        
        ("Chapter-4: Core Components and Functionality", 
         "The functionality of DeepScan is encapsulated within several core React components. The File Uploader is the primary interaction point, supporting intuitive drag-and-drop mechanics. Users can select the scope of their scan, be it a single file, a folder, a web URL, or a direct SHA-256 hash input. During the submission phase, the interface transitions into an active scanning state, deploying the aforementioned radar animations to indicate ongoing background processes. Following the scan, the Results Dashboard renders the threat intelligence data. It displays critical metrics such as the number of security engines that flagged the target (e.g., 64 out of 72 engines) and categorizes the overall risk level into Safe, Low, Medium, or High classifications. The dashboard also provides specific malware nomenclature and technical explanations, ensuring the user understands the nature of the threat. Additionally, the Scan History component maintains a chronological record of all user activities during the session. Presented in a clean, terminal-style tabular format, it logs the target name, scan type, determined risk level, and timestamp. This feature is essential for auditing and reviewing multiple scan targets over time, enhancing the utility of the terminal."),
        
        ("Chapter-5: Backend Implementation and API", 
         "The backend logic is entirely encapsulated within the Next.js API route located at /api/scan. This endpoint is designed to securely process multipart form data originating from the frontend. For file uploads, the server extracts the file buffer and utilizes the Node.js crypto library to compute an accurate SHA-256 cryptographic hash. This hash acts as a unique fingerprint for the file, a standard practice in threat intelligence platforms like VirusTotal. To simulate a real-world cybersecurity analysis platform, the API incorporates a mock threat intelligence engine. It employs keyword heuristics and hash matching to assign realistic threat profiles. For instance, files containing keywords such as eicar, virus, or keygen are algorithmically flagged and assigned elevated risk levels. The API constructs a comprehensive JSON response detailing the engines flagged, malware type, and technical explanations, artificially introducing a network delay to simulate the time required for deep heuristic analysis."),
        
        ("Chapter-6: Conclusion and Future Scope", 
         "DeepScan successfully demonstrates the capability to build a highly interactive, visually immersive cybersecurity application using modern web frameworks. By prioritizing an engaging cyberpunk aesthetic without sacrificing technical robustness, the project reimagines how users interact with security tools. The modular architecture established by Next.js and React provides a solid foundation for future enhancements. Future iterations of DeepScan could integrate directly with live threat intelligence APIs, such as the VirusTotal API, to provide real-time, authentic malware analysis. Additionally, implementing user authentication and integrating a persistent database system like PostgreSQL would allow for long-term storage of scan histories and customized user preferences across sessions, further elevating the application into a comprehensive security platform.")
    ]

    for title, text in content:
        story.append(Paragraph(title, heading_style))
        story.append(Paragraph(text, normal_style))
        story.append(Spacer(1, 0.2 * inch))

    # 6) Page numbers at bottom middle -> handled by add_page_number
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)

if __name__ == "__main__":
    generate_pdf()

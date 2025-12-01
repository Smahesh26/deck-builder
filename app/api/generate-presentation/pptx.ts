import pptxgen from "pptxgenjs";

export async function generatePPTX({
  projectName,
  websiteData,
  logo,
  products,
  businessDetails,
  selectedTemplate,
}: {
  projectName: string;
  websiteData: any;
  logo: string;
  products: Array<{ name: string; description?: string }>;
  businessDetails: any;
  selectedTemplate: number;
}) {
  const pres = new pptxgen();

  // Apply template styling based on selectedTemplate
  let primaryColor = "#1E40AF"; // default blue
  let accentColor = "#F59E0B"; // default amber
  let backgroundColor = "#FFFFFF";

  switch (selectedTemplate) {
    case 1:
      primaryColor = "#1E40AF";
      accentColor = "#F59E0B";
      break;
    case 2:
      primaryColor = "#DC2626";
      accentColor = "#059669";
      break;
    case 3:
      primaryColor = "#7C3AED";
      accentColor = "#EC4899";
      break;
    case 4:
      primaryColor = "#047857";
      accentColor = "#DC2626";
      break;
  }

  // Title slide
  const slide1 = pres.addSlide();
  slide1.background = { color: backgroundColor };
  slide1.addText(projectName, { 
    x: 1, y: 1.5, w: 8, h: 1.5,
    fontSize: 32, 
    fontFace: "Arial",
    bold: true,
    color: primaryColor,
    align: "center"
  });
  
  if (websiteData?.title) {
    slide1.addText(websiteData.title, { 
      x: 1, y: 3, w: 8, h: 1,
      fontSize: 24,
      fontFace: "Arial",
      color: accentColor,
      align: "center"
    });
  }

  // Company overview slide
  if (websiteData?.description || businessDetails) {
    const overviewSlide = pres.addSlide();
    overviewSlide.background = { color: backgroundColor };
    overviewSlide.addText("About Us", { 
      x: 1, y: 0.5, w: 8, h: 1,
      fontSize: 28, 
      fontFace: "Arial",
      bold: true,
      color: primaryColor
    });
    
    const description = websiteData?.description || businessDetails?.description || "Leading company in our industry";
    overviewSlide.addText(description, { 
      x: 1, y: 1.5, w: 8, h: 4,
      fontSize: 18,
      fontFace: "Arial",
      color: "#374151"
    });
  }

  // Product slides
  products.forEach((product, index) => {
    const slide = pres.addSlide();
    slide.background = { color: backgroundColor };
    
    slide.addText(product.name, { 
      x: 1, y: 0.5, w: 8, h: 1,
      fontSize: 28, 
      fontFace: "Arial",
      bold: true,
      color: primaryColor
    });
    
    if (product.description) {
      slide.addText(product.description, { 
        x: 1, y: 1.5, w: 8, h: 4,
        fontSize: 18,
        fontFace: "Arial",
        color: "#374151"
      });
    }

    // Add slide number
    slide.addText(`${index + 1}`, {
      x: 9, y: 6.5, w: 0.5, h: 0.5,
      fontSize: 12,
      color: accentColor,
      align: "center"
    });
  });

  // Generate file buffer instead of saving to disk
  const fileName = `presentation-${Date.now()}.pptx`;
  const pptxBuffer = await pres.write({ outputType: "nodebuffer" });
  
  return {
    buffer: pptxBuffer,
    fileName,
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  };
}

// Additional code can be added here if necessary

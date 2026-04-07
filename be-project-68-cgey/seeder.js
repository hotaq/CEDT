const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config/.env" });

const Company = require("./model/Company");
const Job = require("./model/Job");
const User = require("./model/User");

const adminUser = {
    name: "mock-admin-root",
    telephone: "000-000-0000",
    email: "admin@booking-interview.local",
    password: "Admin123!",
    role: "admin",
};

const companies = [
    {
        name: "Northstar Labs",
        address: "946 Innovation Drive, Seattle, WA 98101",
        website: "https://northstarlabs.example.com",
        photoUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        description:
            "Northstar Labs builds internal tooling and platform services for engineering teams scaling B2B products.",
        telephone: "206-555-0101",
    },
    {
        name: "Harbor Health Systems",
        address: "220 Harbor Avenue, Boston, MA 02110",
        website: "https://harborhealth.example.com",
        photoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        description:
            "Harbor Health Systems operates patient engagement software and scheduling tools for regional clinics.",
        telephone: "617-555-0112",
    },
    {
        name: "Atlas Commerce",
        address: "510 Market Street, San Francisco, CA 94105",
        website: "https://atlascommerce.example.com",
        photoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        description:
            "Atlas Commerce provides checkout, fulfillment, and marketplace analytics infrastructure for retailers.",
        telephone: "415-555-0134",
    },
    {
        name: "BluePeak Finance",
        address: "88 Wall Street, New York, NY 10005",
        website: "https://bluepeakfinance.example.com",
        photoUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        description:
            "BluePeak Finance builds fintech products for lending workflows, risk controls, and customer reporting.",
        telephone: "212-555-0156",
    },
    {
        name: "Luma Learning",
        address: "400 College Road, Austin, TX 78701",
        website: "https://lumalearning.example.com",
        photoUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        description:
            "Luma Learning creates digital learning products, content management tools, and analytics for education teams.",
        telephone: "512-555-0188",
    },
    {
        name: "TerraGrid Energy",
        address: "1200 Solar Way, Denver, CO 80202",
        website: "https://terragrid.example.com",
        photoUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
        description:
            "TerraGrid Energy manages renewable operations data, field inspections, and forecasting software.",
        telephone: "303-555-0199",
    },
    {
        name: "SignalForge Media",
        address: "77 Studio Lane, Los Angeles, CA 90028",
        website: "https://signalforge.example.com",
        photoUrl: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
        description:
            "SignalForge Media develops campaign planning, audience reporting, and publishing tools for media brands.",
        telephone: "323-555-0125",
    },
    {
        name: "Cinder Mobility",
        address: "615 Transit Plaza, Chicago, IL 60601",
        website: "https://cindermobility.example.com",
        photoUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        description:
            "Cinder Mobility runs fleet optimization, operations dashboards, and booking systems for transport operators.",
        telephone: "312-555-0167",
    },
    {
        name: "Verdant Cloud",
        address: "910 Riverfront Street, Portland, OR 97204",
        website: "https://verdantcloud.example.com",
        photoUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
        description:
            "Verdant Cloud ships cloud cost visibility, infrastructure automation, and observability services.",
        telephone: "503-555-0142",
    },
    {
        name: "KiteStack Robotics",
        address: "45 Automation Park, Pittsburgh, PA 15222",
        website: "https://kitestack.example.com",
        photoUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
        description:
            "KiteStack Robotics combines industrial control software, simulation, and data services for robotics teams.",
        telephone: "412-555-0173",
    },
];

const jobs = [
    {
        companyName: "Northstar Labs",
        title: "Backend Engineer",
        description:
            "Build internal APIs, data pipelines, and service integrations for engineering productivity products.",
        skills: ["Node.js", "MongoDB", "REST", "Docker"],
        jobType: "Full-time",
        isRemote: true,
        salaryMin: 95000,
        salaryMax: 125000,
        location: "Seattle, WA",
    },
    {
        companyName: "Harbor Health Systems",
        title: "Frontend Engineer",
        description:
            "Develop patient-facing dashboards and admin tools with a strong focus on accessibility and reliability.",
        skills: ["React", "TypeScript", "Accessibility", "Testing"],
        jobType: "Full-time",
        isRemote: false,
        salaryMin: 90000,
        salaryMax: 118000,
        location: "Boston, MA",
    },
    {
        companyName: "Atlas Commerce",
        title: "Data Analyst Intern",
        description:
            "Analyze catalog, conversion, and fulfillment datasets to support retail performance reporting.",
        skills: ["SQL", "Python", "Analytics", "Excel"],
        jobType: "Internship",
        isRemote: true,
        salaryMin: 22000,
        salaryMax: 28000,
        location: "San Francisco, CA",
    },
    {
        companyName: "BluePeak Finance",
        title: "Product Designer",
        description:
            "Design financial workflow tools and turn research into polished product flows for operations teams.",
        skills: ["Figma", "UX", "Design Systems", "Prototyping"],
        jobType: "Full-time",
        isRemote: true,
        salaryMin: 85000,
        salaryMax: 110000,
        location: "New York, NY",
    },
    {
        companyName: "Luma Learning",
        title: "QA Engineer",
        description:
            "Own manual and automated quality checks across classroom, student, and reporting experiences.",
        skills: ["Cypress", "Manual Testing", "API Testing", "JavaScript"],
        jobType: "Contract",
        isRemote: true,
        salaryMin: 60000,
        salaryMax: 78000,
        location: "Austin, TX",
    },
    {
        companyName: "TerraGrid Energy",
        title: "DevOps Engineer",
        description:
            "Improve deployment automation, infrastructure monitoring, and release safety across field systems.",
        skills: ["AWS", "Terraform", "CI/CD", "Linux"],
        jobType: "Full-time",
        isRemote: false,
        salaryMin: 98000,
        salaryMax: 130000,
        location: "Denver, CO",
    },
    {
        companyName: "SignalForge Media",
        title: "Content Strategist",
        description:
            "Plan editorial operations and campaign content structures using audience and engagement insights.",
        skills: ["Content", "SEO", "Analytics", "Copywriting"],
        jobType: "Part-time",
        isRemote: true,
        salaryMin: 42000,
        salaryMax: 58000,
        location: "Los Angeles, CA",
    },
    {
        companyName: "Cinder Mobility",
        title: "Mobile Engineer",
        description:
            "Ship rider and operator mobile features with a focus on reliability in real-world transit flows.",
        skills: ["React Native", "Mobile", "REST", "Performance"],
        jobType: "Full-time",
        isRemote: false,
        salaryMin: 93000,
        salaryMax: 122000,
        location: "Chicago, IL",
    },
    {
        companyName: "Verdant Cloud",
        title: "Site Reliability Engineer",
        description:
            "Scale observability, incident response, and platform resilience for cloud infrastructure customers.",
        skills: ["Kubernetes", "Go", "Observability", "On-call"],
        jobType: "Full-time",
        isRemote: true,
        salaryMin: 105000,
        salaryMax: 140000,
        location: "Portland, OR",
    },
    {
        companyName: "KiteStack Robotics",
        title: "Machine Learning Engineer",
        description:
            "Train and deploy models that improve simulation quality, control loops, and robotic task planning.",
        skills: ["Python", "PyTorch", "ML", "Robotics"],
        jobType: "Full-time",
        isRemote: false,
        salaryMin: 115000,
        salaryMax: 150000,
        location: "Pittsburgh, PA",
    },
    {
        companyName: "Northstar Labs",
        title: "Platform Engineer",
        description:
            "Improve shared services, developer tooling, and deployment reliability for internal product teams.",
        skills: ["Node.js", "Kubernetes", "CI/CD", "PostgreSQL"],
        jobType: "Full-time",
        isRemote: true,
        salaryMin: 102000,
        salaryMax: 132000,
        location: "Seattle, WA",
    },
    {
        companyName: "Atlas Commerce",
        title: "Business Analyst",
        description:
            "Translate commerce operations requirements into dashboards, reporting workflows, and backlog priorities.",
        skills: ["SQL", "Stakeholder Management", "Reporting", "Excel"],
        jobType: "Full-time",
        isRemote: false,
        salaryMin: 76000,
        salaryMax: 98000,
        location: "San Francisco, CA",
    },
    {
        companyName: "BluePeak Finance",
        title: "Compliance Operations Specialist",
        description:
            "Support controls, reviews, and audit workflows across customer onboarding and financial operations.",
        skills: ["Compliance", "Documentation", "Risk", "Operations"],
        jobType: "Full-time",
        isRemote: true,
        salaryMin: 68000,
        salaryMax: 90000,
        location: "New York, NY",
    },
    {
        companyName: "Verdant Cloud",
        title: "Cloud Support Engineer",
        description:
            "Resolve infrastructure incidents, guide customers through troubleshooting, and improve runbooks.",
        skills: ["AWS", "Linux", "Troubleshooting", "Support"],
        jobType: "Full-time",
        isRemote: true,
        salaryMin: 82000,
        salaryMax: 106000,
        location: "Portland, OR",
    },
    {
        companyName: "KiteStack Robotics",
        title: "Embedded Software Engineer",
        description:
            "Build low-level integrations between robotic control software, sensors, and simulation environments.",
        skills: ["C++", "Embedded Systems", "Robotics", "Linux"],
        jobType: "Full-time",
        isRemote: false,
        salaryMin: 108000,
        salaryMax: 142000,
        location: "Pittsburgh, PA",
    },
];

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
};

const seedCompanies = async () => {
    await Company.bulkWrite(
        companies.map((company) => ({
            updateOne: {
                filter: { name: company.name },
                update: { $set: company },
                upsert: true,
            },
        }))
    );

    return Company.find({ name: { $in: companies.map((company) => company.name) } });
};

const seedJobs = async (companyDocs) => {
    const companyMap = new Map(
        companyDocs.map((company) => [company.name, company._id])
    );

    await Job.bulkWrite(
        jobs.map((job) => ({
            updateOne: {
                filter: {
                    title: job.title,
                    company: companyMap.get(job.companyName),
                },
                update: {
                    $set: {
                        title: job.title,
                        company: companyMap.get(job.companyName),
                        description: job.description,
                        skills: job.skills,
                        jobType: job.jobType,
                        isRemote: job.isRemote,
                        salaryMin: job.salaryMin,
                        salaryMax: job.salaryMax,
                        location: job.location,
                    },
                },
                upsert: true,
            },
        }))
    );
};

const seedAdmin = async () => {
    let user = await User.findOne({ email: adminUser.email });

    if (!user) {
        user = new User(adminUser);
    } else {
        user.name = adminUser.name;
        user.telephone = adminUser.telephone;
        user.email = adminUser.email;
        user.password = adminUser.password;
        user.role = adminUser.role;
    }

    await user.save();
    return user;
};

const run = async () => {
    try {
        await connectDB();

        const seededAdmin = await seedAdmin();
        const companyDocs = await seedCompanies();
        await seedJobs(companyDocs);

        const companyCount = await Company.countDocuments({
            name: { $in: companies.map((company) => company.name) },
        });
        const jobCount = await Job.countDocuments({
            title: { $in: jobs.map((job) => job.title) },
            company: { $in: companyDocs.map((company) => company._id) },
        });

        console.log(`Seeded companies: ${companyCount}`);
        console.log(`Seeded jobs: ${jobCount}`);
        console.log(`Seeded admin: ${seededAdmin.email}`);
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

run();

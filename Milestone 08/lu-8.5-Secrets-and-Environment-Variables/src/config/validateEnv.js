const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"];

function validateEnv() {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missingEnvVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
  }
}

module.exports = validateEnv;

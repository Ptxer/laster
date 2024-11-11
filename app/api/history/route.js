import mysql from "mysql2/promise";

export async function GET(req) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [updateResult] = await connection.execute(`
      UPDATE patientrecord
      SET status = 0
      WHERE status = 1
        AND DATE(datetime) < CURDATE();
    `);
    console.log(
      `Updated ${updateResult.affectedRows} patient records to inactive if left from previous day.`
    );

    // Fetch the updated patient records along with symptom and pill information
    const [rows] = await connection.execute(`
      SELECT
        pr.patientrecord_id,
        p.patient_id,
        p.patient_name,
        pt.patienttype_name AS role,
        pr.datetime,
        pr.status,
        pr.other_symptom,
        (SELECT GROUP_CONCAT(s.symptom_name ORDER BY s.symptom_id)
         FROM symptomrecord sr
         LEFT JOIN symptom s ON s.symptom_id = sr.symptom_id
         WHERE sr.patientrecord_id = pr.patientrecord_id) AS symptom_names,
        (SELECT GROUP_CONCAT(pr.pillstock_id ORDER BY pr.pillstock_id)
         FROM pillrecord pr
         WHERE pr.patientrecord_id = pr.patientrecord_id) AS pillstock_ids,
        (SELECT GROUP_CONCAT(p.pill_name ORDER BY pr.pillstock_id)
         FROM pillrecord pr
         LEFT JOIN pillstock ps ON pr.pillstock_id = ps.pillstock_id
         LEFT JOIN pill p ON ps.pill_id = p.pill_id
         WHERE pr.patientrecord_id = pr.patientrecord_id) AS pill_names,
        (SELECT GROUP_CONCAT(pr.quantity ORDER BY pr.pillstock_id)
         FROM pillrecord pr
         WHERE pr.patientrecord_id = pr.patientrecord_id) AS pill_quantities
      FROM
        patientrecord pr
      JOIN
        patient p ON pr.patient_id = p.patient_id
      JOIN
        patient_type pt ON p.patienttype_id = pt.patienttype_id
      ORDER BY
        pr.datetime DESC;
    `);

    await connection.end();

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
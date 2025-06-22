/**
 * @file src/server.js
 * @description ملف الخادم الرئيسي للتطبيق
 * @updated ['2025-06-22', ]
 * @author ['BomBa', ]
 * @version v0.0.1
 */

//#region 📦 استيراد المكتبات والوحدات (Import)
import { express, nodemailer, dotenv, bodyParser } from './utils/alias.js'; // استيراد المساعدات العامة
//#endregion

//#region ⚙️ إعدادات أساسية (Environment Variables)
// الحصول على المسار الحالي
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// إعدادات البيئة
const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';
//#endregion

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// استخدام middleware لتحليل JSON وبيانات النموذج
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تكوين ناقل البريد الإلكتروني باستخدام بيانات Mailtrap من ملف .env
const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

//#region 🧭 إعداد المسارات
// الصفحة الرئيسية
// app.get('/', (req, res) => { res.sendFile(join(__dirname, '..', 'public', 'index.html')); });
app.get('/', (req, res) => { res.send('Hello to BomBa Server ♥'); });

// مسار API لإرسال رسالة نصية عادية
app.post('/api/send-text-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!to || !subject || !text) {
      return res
        .status(400)
        .json({ error: 'يجب توفير حقول to و subject و text' });
    }

    // خيارات البريد الإلكتروني
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'sender@example.com',
      to,
      subject,
      text,
    };

    // إرسال البريد الإلكتروني
    const info = await transport.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'تم إرسال البريد الإلكتروني بنجاح',
      info: info.messageId,
    });
  } catch (error) {
    console.error('خطأ في إرسال البريد:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في إرسال البريد الإلكتروني',
      details: error.message,
    });
  }
});

// مسار API لإرسال رسالة HTML
app.post('/api/send-html-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!to || !subject || !html) {
      return res
        .status(400)
        .json({ error: 'يجب توفير حقول to و subject و html' });
    }

    // خيارات البريد الإلكتروني
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'sender@example.com',
      to,
      subject,
      html,
    };

    // إرسال البريد الإلكتروني
    const info = await transport.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'تم إرسال البريد الإلكتروني بنجاح',
      info: info.messageId,
    });
  } catch (error) {
    console.error('خطأ في إرسال البريد:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في إرسال البريد الإلكتروني',
      details: error.message,
    });
  }
});

// مسار لعرض نموذج إرسال البريد (اختياري)
app.get('/send-email-form', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>نموذج إرسال بريد إلكتروني</h1>
        <form action="/api/send-html-email" method="post">
          <label>إلى: <input type="email" name="to" required></label><br>
          <label>الموضوع: <input type="text" name="subject" required></label><br>
          <label>المحتوى (HTML): <textarea name="html" required></textarea></label><br>
          <button type="submit">إرسال</button>
        </form>
      </body>
    </html>
  `);
});
//#endregion

//#region 🚀 تشغيل الخادم (SERVER LISTEN)

// بدء تشغيل الخادم
const server = app.listen(SERVER_PORT, async () => {
  console.log(`🏗️  Server is running in ${NODE_ENV} mode...`);
  console.log(`🖥️  The Server is running: ${SERVER_URL}:${SERVER_PORT}`);
  console.log(`📚 Swagger api: ${SERVER_URL}:${SERVER_PORT}/api-docs`);
});

// // معالجة الوعود غير المعالجة
// // error handle Rejection ** أخطاء خارج السيرفر مثل (إنقطاع الإتصال بقاعدة البيانات)
// process.on('unhandledRejection', (err) => {
//   // eslint-disable-next-line no-undef
//   console.error(`💥 11 Unhandled Rejection Error: ${err.name} | ${err.message}`);
//   // eslint-disable-next-line no-undef
//   if (NODE_ENV === 'development'){ console.error(err.stack);}
//   // إغلاق الخادم بشكل آمن
//   server.close(() => { process.exit(1); });
// });

// // في نهاية التطبيق (عند الإغلاق)
// process.on('exit', async () => {
//   if (db) {await dbConnCloses();
//   // eslint-disable-next-line no-undef
//     console.info('🔌 Database connection closed successfully.'); // تم غلق اتصال قاعدة البيانات بنجاح
//   }
//   // eslint-disable-next-line no-undef
//   console.info('🛑 Server is shutting down gracefully...');
// });
//#endregion

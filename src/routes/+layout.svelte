<script lang="ts">
	import '@fontsource/chakra-petch';
	import '@fontsource/ibm-plex-sans-thai';
	import { fetchDocCerts } from '$lib/worker-common';
	import '../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import {
		storePopup,
		AppShell,
		AppBar,
		Modal,
		Toast,
		initializeStores,
		LightSwitch,
		Drawer, getDrawerStore
	} from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';

	// Font Awesome
	import '@fortawesome/fontawesome-free/css/fontawesome.css';
	import '@fortawesome/fontawesome-free/css/brands.css';
	import '@fortawesome/fontawesome-free/css/solid.css';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	initializeStores();
	const drawerStore = getDrawerStore();

	function openDrawer(id: string, meta?: any) {
		const drawerSettings: DrawerSettings = {
			// Provide your property overrides:
			bgDrawer: 'bg-white dark:bg-slate-800',
			bgBackdrop: 'bg-gradient-to-tr from-primary-500/50 via-secondary-500/50 to-tertiary-500/50',
			padding: 'p-6',
			rounded: 'rounded-xl',
			id,
			meta
		};
		drawerStore.open(drawerSettings);
	}
</script>
<Modal />
<Toast />
<Drawer>
	<div class="m-4 p-4 pl-8 container">
		{#if $drawerStore.id === 'docs'}
			<h1 class="h1 my-2 text-xl">คำอธิบาย</h1>
			<h2 class="h2 my-2 text-lg">ที่มาและข้อกฎหมาย</h2>
			<p>
				<a
					href="https://www.etda.or.th/th/Useful-Resource/%E0%B8%81%E0%B8%8F%E0%B8%AB%E0%B8%A1%E0%B8%B2%E0%B8%A2-HTML/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%9A%E0%B8%8D%E0%B8%8D%E0%B8%95%E0%B8%A7%E0%B8%B2%E0%B8%94%E0%B8%A7%E0%B8%A2%E0%B8%98%E0%B8%A3%E0%B8%81%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%97%E0%B8%B2%E0%B8%87%E0%B8%AD%E0%B9%80%E0%B8%A5%E0%B8%81%E0%B8%97%E0%B8%A3%E0%B8%AD%E0%B8%99%E0%B8%81%E0%B8%AA/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%9A%E0%B8%8D%E0%B8%8D%E0%B8%95%E0%B8%A7%E0%B8%B2%E0%B8%94%E0%B8%A7%E0%B8%A2%E0%B8%98%E0%B8%A3%E0%B8%81%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%97%E0%B8%B2%E0%B8%87%E0%B8%AD%E0%B9%80%E0%B8%A5%E0%B8%81%E0%B8%97%E0%B8%A3%E0%B8%AD%E0%B8%99%E0%B8%81%E0%B8%AA-%E0%B8%9E-%E0%B8%A8-2544-(%E0%B8%89%E0%B8%9A%E0%B8%9A%E0%B9%81%E0%B8%81%E0%B9%84%E0%B8%82%E0%B9%80%E0%B8%9E%E0%B8%A1%E0%B9%80%E0%B8%95%E0%B8%A1).aspx"
					target="_blank"
					rel="noreferrer"
					referrerpolicy="no-referrer"
					class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
				>พระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544</a> กำหนดให้เอกสารอิเล็กทรอนิกส์จะมีลายมือชื่ออิเล็กทรอนิกส์ที่เชื่อถือได้ ต้องสามารถตรวจสอบความเชื่อมโยงไปยังเจ้าของลายมือชื่อโดยไม่เชื่อมโยงไปยังบุคคลอื่นภายใต้สภาพที่นำมาใช้ (มาตรา 26 อนุมาตรา 1) และต้องสามารถตรวจสอบการเปลี่ยนแปลงใดแก่ข้อความนั้นได้นับแต่เวลาที่ลงลายมือชื่ออิเล็กทรอนิกส์ (มาตรา 26 อนุมาตรา 4) ทั้งจะต้องแจ้งให้บุคคลที่คาดหมายได้โดยมีเหตุอันควรเชื่อว่าจะกระทำการใดโดยขึ้นอยู่กับลายมือชื่ออิเล็กทรอนิกส์หรือให้บริการเกี่ยวกับลายมือชื่อออิเล็กทรอนิกส์ทราบโดยมิชักช้า (มาตรา 27 อนุมาตรา 2)
			</p>
			<p>
				นอกจากนี้ ในการใช้เอกสารอิเล็กทรอนิกส์กับหน่วยงานบางแห่ง มีข้อกำหนดให้ต้องสามารถตรวจสอบการลงลายมือชื่ออิเล็กทรอนิกส์ที่เชื่อถือได้ เช่น
				<a
					href="https://library.coj.go.th/th/pdf-view.html?fid=14276&table=files_biblio&main=legal-information-center&category=legal-database"
					target="_blank"
					rel="noreferrer"
					referrerpolicy="no-referrer"
					class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
				>ข้อกำหนดของประธานาศาฎีกา ว่าด้วยวิธีพิจารณาคดีทางอิเล็กทรอนิกส์ พ.ศ. 2563</a> ข้อ 10 กำหนดให้อาจใช้ลายมือชื่ออิเล็กทรอนิกส์ได้หากใช้วิธีการอื่นใดที่สามารถยืนยันตัวเจ้าของลายมือชื่อและสามารถแสดงเจตนาของเจ้าของลายมือชื่อได้ด้วยวิธีการนั้นเองหรือประกอบพยานหลักฐานอื่น
			</p>
			<p>ด้วยแหตุและผลดังที่กล่าวมาข้างต้น จึงเป็นที่มาของการจัดทำเว็บไซต์นี้ขึ้น เพื่อสนับสนุนการตรวจสอบดังกล่าว</p>
			<h2 class="h2 my-2 text-lg">วิธีการจัดสร้างและลงลายมือชื่ออิเล็กทรอนิกส์</h2>
			<p>นอกเหนือจากการลงลายมือชื่ออย่างธรรมดาตามมาตรา 9 แห่งพระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544 ข้าพเจ้าจะลงลายมือชื่ออิเล็กทรอนิกส์ที่เชื่อถือได้ ด้วยวิธีการดังจะกล่าวต่อไปนี้</p>
			<ol class="list-decimal list-outside m-4">
				<li class="my-1">
					<b>การลงลายมือชื่อตามมาตรา 26</b> วิธีนี้จะลงลายมือชื่อบนเอกสารอิเล็กทรอนิกส์ โดย
					<ul class="list-disc list-outside mx-4 my-2">
						<li>
							สร้างรายการจัดทำเอกสาร เพื่อกำหนดหมายเลขประจำตัวเอกสาร
						</li>
						<li>
							สร้างเอกสารอิเล็กทรอนิกส์รูปแบบ Portable Document Format (PDF) และลงลายมือชื่อด้วยรูปภาพลายเซ็นพร้อมลงชื่อของข้าพเจ้า อันเป็นการลงลายมือชื่ออย่างธรรมดาตามมาตรา 9 บนเครื่องคอมพิวเตอร์ที่ข้าพเจ้าเท่านั้นเป็นผู้ควบคุม
						</li>
						<li>
							จัดทำภาพสำเนาเอกสารขนาดย่อม (Thumbnail) เพื่อประกอบการแสดงผลการตรวจสอบ
						</li>
						<li>
							คำนวนรหัสตัวแทนจากเอกสาร PDF ในข้อก่อนหน้า (hash) เพื่อใช้ในการตรวจสอบการแก้ไขเปลี่ยนแปลงสาระสำคัญโดย
							<a
								href="https://en.wikipedia.org/wiki/SHA-2"
								target="_blank"
								rel="noreferrer"
								referrerpolicy="no-referrer"
								class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
							>ขั้นตอนแบบ SHA-256</a>
						</li>
						<li>ประทับเวลาสร้างเอกสารด้วย
							<a
								href="https://opentimestamps.org/"
								target="_blank"
								rel="noreferrer"
								referrerpolicy="no-referrer"
								class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
							>มาตรฐาน OpenTimestamp</a> เพื่อยืนยันวันและเวลาในการลงลายมือชื่อกับหน่วยงานภายนอก</li>
						<li>
							สร้างเอกสาร PDF ที่เข้ารหัสในการเข้าถึงจากเอกสาร PDF ในข้อก่อนหน้า
						</li>
						<li>
							นำส่งภาพสำเนาเอกสาร, บันทึกการประทับตรา, ข้อมูลอภิพันธุ์ (metadata) อันรวมถึงรหัสตัวแทนเอกสาร, และเอกสาร PDF ที่เข้ารหัสแล้ว ไปยัง
							<a
								href="https://docs.ipfs.tech/concepts/what-is-ipfs/"
								target="_blank"
								class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
							>เครือข่าย InterPlanetary File System (IPFS)</a> เพื่อบันทึกข้อมูลเอกสารสำหรับการสอบทานในอนาคต
						</li>
						<li>
							นำส่งข้อมูลอภิพันธุ์ (metadata) อันรวมถึงรหัสตัวแทนเอกสาร, และรหัสเฉพาะของเอกสารในเครือข่าย IPFS จากข้อก่อนหน้าไปยัง
							<a
								href="https://spl.solana.com/memo"
								target="_blank"
								class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
							> Blockchain Solana</a> เพื่อบันทึกธุรกรรม
						</li>
						<li>
							บันทึกข้อมูลทั้งหมดลงในเอกสาร PDF ที่สมบูรณ์ โดยรวมถึงรหัสประจำตัวเอกสาร และ QR code สำหรับตรวจสอบเอกสาร
						</li>
						<li>
							นำส่งข้อมูลอภิพันธุ์ (metadata) และเอกสาร PDF ที่สมบูรณ์ไปยังระบบจัดการรายการจัดทำเอกสาร เพื่อบันทึกการทำเอกสารเสร็จสมบูรณ์
						</li>
						<li>
							ข้าพเจ้ารับเอกสาร PDF ที่สมบูรณ์ผ่านช่องทางที่ข้าพเจ้าแต่เพียงผู้เดียวมีสิทธิ์เข้าถึงและควบคุม
						</li>
					</ul>
				</li>
				<li class="my-1">
					<b>การลงลายมือชื่อตามมาตรา 28</b> วิธีนี้จะลงลายมือชื่อบนเอกสารอิเล็กทรอนิกส์ โดย
					<ul class="list-disc list-outside mx-4 my-2">
						<li>
							สร้างรายการจัดทำเอกสาร เพื่อกำหนดหมายเลขประจำตัวเอกสาร
						</li>
						<li>
							สร้างเอกสารอิเล็กทรอนิกส์รูปแบบ Portable Document Format (PDF) และลงลายมือชื่อด้วยรูปภาพลายเซ็นพร้อมลงชื่อของข้าพเจ้า อันเป็นการลงลายมือชื่ออย่างธรรมดาตามมาตรา 9 บนเครื่องคอมพิวเตอร์ที่ข้าพเจ้าเท่านั้นเป็นผู้ควบคุม
						</li>
						<li>
							จัดทำภาพสำเนาเอกสารขนาดย่อม (Thumbnail) เพื่อประกอบการแสดงผลการตรวจสอบ
						</li>
						<li>
							คำนวนรหัสตัวแทนจากเอกสาร PDF ในข้อก่อนหน้า (hash) เพื่อใช้ในการตรวจสอบการแก้ไขเปลี่ยนแปลงสาระสำคัญโดย
							<a
								href="https://en.wikipedia.org/wiki/SHA-2"
								target="_blank"
								rel="noreferrer"
								referrerpolicy="no-referrer"
								class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
							>ขั้นตอนแบบ SHA-256</a>
						</li>
						<li>
							ประทับเวลาสร้างเอกสารด้วย
							<a
								href="https://www.ietf.org/rfc/rfc3161.txt"
								target="_blank"
								rel="noreferrer"
								referrerpolicy="no-referrer"
								class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
							>มาตรฐาน Internet X.509 Public Key Infrastructure Time-Stamp Protocol (RFC3161)</a> เพื่อยืนยันวันและเวลาในการลงลายมือชื่อกับหน่วยงานภายนอก ได้แก่
							<a
								href="https://www.sectigo.com/resource-library/time-stamping-server"
								target="_blank"
								rel="noreferrer"
								referrerpolicy="no-referrer"
								class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
							>Sectigo</a>
						</li>
						<li>
							ลงลายมือชื่่ออิเล็กทรอนิกส์ด้วยใบรับรองอิเล็กทรอนิกส์
						</li>
						<li>
							บันทึกข้อมูลทั้งหมดลงในเอกสาร PDF ที่สมบูรณ์ โดยรวมถึงรหัสประจำตัวเอกสาร และ QR code สำหรับตรวจสอบเอกสาร
						</li>
						<li>
							นำส่งข้อมูลอภิพันธุ์ (metadata) และเอกสาร PDF ที่สมบูรณ์ไปยังระบบจัดการรายการจัดทำเอกสาร เพื่อบันทึกการทำเอกสารเสร็จสมบูรณ์
						</li>
						<li>
							ข้าพเจ้ารับเอกสาร PDF ที่สมบูรณ์ผ่านช่องทางที่ข้าพเจ้าแต่เพียงผู้เดียวมีสิทธิ์เข้าถึงและควบคุม
						</li>
					</ul>
				</li>
			</ol>
			<h2 class="h2 my-2 text-lg">การตรวจสอบเบื้องต้น</h2>
			<p>
				เอกสารที่ข้าพเจ้าลงลายมือชื่ออิเล็กทรอนิกส์ที่่เชื่อถือได้ ในหน้าแรกของเอกสาร จะต้องมีองค์ประกอบต่อไปนี้
			</p>
			<div class="flex gap-x-5 content-center items-center">
				<div class="flex-none">
					<img
						src="/how-to-check.png"
						alt="How to check valid document"
						class="h-[80vh] w-auto shadow-lg mr-5 my-4"
					/>
				</div>
				<div class="flex-auto">
					<ol class="list-decimal list-outside me-10 clear-left">
						<li>ต้องมีข้อความบรรยายว่า <q class="px-2">เอกสารฉบับนี้ <i>นายราชศักดิ์ รักษ์กำเนิด</i> ได้รับรองว่าเป็นเอกสารอิเล็กทรอนิกส์ต้นฉบับ และลงลายมือชื่ออิเล็กทรอนิกส์ที่เชื่อถือได้ตามมาตรา 26 (หรือ 28) แห่งพระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544</q></li>
						<li>บรรทัดสุดท้าย ระบุกระบวนการรับรองเอกสาร</li>
						<li>บรรทัดสุดท้าย ระบุรหัสเฉพาะของเอกสาร</li>
						<li>บรรทัดสุดท้าย ระบุรหัสวันเวลาประทับเวลาลงลายมือชื่อ</li>
						<li>แสดง QR code ที่เชื่อมโยงมายังระบบตรวจสอบเอกสารและระบุรหัสเฉพาะของเอกสารนั้นๆ</li>
					</ol>
				</div>
			</div>
			<h2 class="h2 my-2 text-lg">การตรวจสอบด้วยเว็บไซต์</h2>
			<ol class="list-decimal list-outside ml-10 clear-left">
				<li>ไปเว็บไซต์ <a href="/">https://docs-verify.rachasak.org</a></li>
				<li>
					<p>
						<img
							src="/web-step1.png"
							alt="docs-verify.rachasak.org page"
							class="w-2/3 h-auto my-4 mx-[auto] shadow-md text-center"
						>
						ส่งข้อมูล<i>อย่างใดอย่างหนึ่ง</i>ต่อไปนี้
					</p>
					<ul class="list-disc list-outside mx-4 my-2">
						<li>เลือกวิธีการลงลายมือชื่อ และกรอกรหัสประจำเอกสาร จากนั้นกด <q>ตรวจสอบ</q></li>
						<li>ส่งไฟล์เลือกไฟล์เอกสาร PDF ที่ข้าพเจ้านำส่งให้</li>
					</ul>
				</li>
				<li>
					<img
						src="/web-step2.png"
						alt="Correct document"
						class="w-2/3 h-auto my-4 mx-[auto] shadow-md text-center"
					>
					หากข้อมูลหรือเอกสารถูกต้อง ระบบจะแสดงภาพตัวอย่างเอกสารที่ระบบบันทึกไว้ และข้อมูลอภิพันธุ์ (metadata) ของเอกสาร
				</li>
			</ol>
			<h2 class="h2 my-2 text-lg">การตรวจสอบด้วยตนเอง</h2>
			<aside class="alert variant-filled-warning my-4">
				<!-- Icon -->
				<div><i class="fa-solid fa-circle-exclamation"></i></div>
				<!-- Message -->
				<div class="alert-message">
					<h3 class="h3">คำเตือน</h3>
					<p>การตรวจสอบตามขั้นตอนในส่วนนี้ เป็นการตรวจสอบโดยอาศัยความรู้ความเชี่ยวชาญในระดับพอสมควร และเป็นการตรวจสอบในลักษณะเดียวกับที่เว็บไซต์ทำ ท่านจะต้องใช้ความระมัดระวังในการตรวจสอบด้วยวิธีเหล่านี้เอง</p>
				</div>
			</aside>
			<h3 class="h3 my-1 text-md">กรณีลงลายมือชื่อด้วยมาตรา 26</h3>
			<p>
				เอกสารที่ข้าพเจ้าลงลายมือชื่ออิเล็กทรอนิกส์ที่่เชื่อถือได้ตามมาตรา 26 จะมีไฟล์ดังต่อไปนี้แนบมาด้วย (สามารถเข้าถึงได้จากรายการเอกสารแนบ (attachments)):
				<img
					src="/art26-attachments.png"
					alt="List of attachments for Article 26 document"
					class="w-auto h-1/2 my-4 mx-[auto] shadow-md text-center"
				>
			</p>
			<ul class="list-disc list-outside mx-4 my-2">
				<li><code>&lt;ประเภทเอกสาร&gt;-&lt;รหัสเอกสาร&gt;-&lt;ประทับเวลา&gt;.pdf.ots</code> เป็นไฟล์รับรองการประทับเวลาของเอกสาร</li>
				<li><code>metadata.json</code> ข้อมูลอภิพันธุ์ (metadata) ของเอกสารซึ่งรวมถึงรหัสผ่านในรูปแบบ JSON</li>
				<li><code>original.pdf</code> เป็นเอกสารต้นฉบับก่อนการรับรองลายมือชื่อ</li>
			</ul>
			<ol class="list-decimal list-outside ml-10 clear-left">
				<li>
					<img
						src="/art26-file-hash.png"
						alt="File hash comparison for Article 26 document"
						class="w-2/3 h-auto my-4 mx-[auto] shadow-md text-center"
					>
					ตรวจสอบรหัสตัวแทนเอกสาร (file hash) ของไฟล์ <code>original.pdf</code>
					ด้วยรูปแบบกระบวนการ SHA-256 จะต้องตรงกับที่ระบุใน <code>metadata.json</code> field <code>file_hash</code>
				</li>
				<li>
					<img
						src="/art26-timestamp.png"
						alt="Timestamp check for Article 26 document"
						class="w-2/3 h-auto my-4 mx-[auto] shadow-md text-center"
					>
					ตรวจสอบเวลาประทับตรา (timestamp) โดยเข้าไปยังเว็บไซต์ <a
						href="https://opentimestamps.org/"
						target="_blank"
						rel="noreferrer"
						referrerpolicy="no-referrer"
						class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
					>OpenTimestamp</a> ในหัวข้อ STAMP & VERIFY ให้เลือกไฟล์ <code>.ots</code>
					และไฟล์ <code>original.pdf</code> ระบบจะต้องแสดงผลว่าสำเร็จ
				</li>
				<li>
					<img
						src="/art26-ipfs.png"
						alt="IPFS file Article 26 document"
						class="w-2/3 h-auto my-4 mx-[auto] shadow-md text-center"
					>
					ตรวจสอบการมีอยู่จริงของไฟล์บนเครือข่าย IPFS โดยเข้าถึงเครือข่าย IPFS หรือเข้าไปยังเว็บไซต์ <a
						href="https://explore.ipld.io/"
						target="_blank"
						rel="noreferrer"
						referrerpolicy="no-referrer"
						class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
					>IPLD EXPLORER</a> ใส่รหัสที่ตั้งไฟล์โดยใช้ข้อมูลจาก <code>metadata.json</code> field <code>cid</code>
					ระบบจะต้องแสดงรายการไฟล์ที่เกี่ยวข้อง รวมถึงไฟล์ <code>pdf</code> ที่เข้ารหัสไว้ ท่านมาสารถใช้รหัสผ่านที่ระบุใน field <code>password</code>
					เพื่อสอบเทียบเอกสารที่ท่านได้รับกับที่ระบบฝากไว้บน IPFS ว่าจะต้องแสดงข้อมูลสำคัญตรงกัน
				</li>
				<li>
					<img
						src="/art26-solana.png"
						alt="Timestamp check for Article 26 document"
						class="w-2/3 h-auto my-4 mx-[auto] shadow-md text-center"
					>
					ตรวจสอบการมีอยู่จริงของธุรกรรมบน blockchain โดยเข้าไปยังเว็บไซต์ <a
						href="https://explorer.solana.com/"
						target="_blank"
						rel="noreferrer"
						referrerpolicy="no-referrer"
						class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
					>Solana explore</a> เลือก Cluster ให้ตรงกับ <code>metadata.json</code> field <code>solana_rpc</code>
					จากนั้นกรอกรหัส transaction โดยใช้ข้อมูลจาก field <code>signature</code> ระบบจะต้องแสดงรายการธุรกรรมที่เกิดขึ้นในเวลาใกล้เคียงกับเวลาที่ลงลายมือชื่อ<br/>
					นอกจากนี้ ในช่อง <code>Data (UTF-8)</code> ระบบจะต้องแสดงข้อมูล JSON ที่มีสาระสำคัญเหมิือน <code>metadata.json</code>
					<img
						src="/art26-solana-log.png"
						alt="Timestamp check for Article 26 document"
						class="w-2/3 h-auto my-4 mx-[auto] shadow-md text-center"
					>
				</li>
			</ol>
			<h3 class="h3 my-1 text-md">กรณีลงลายมือชื่อด้วยมาตรา 28</h3>
			<p>
				เอกสารที่ข้าพเจ้าลงลายมือชื่ออิเล็กทรอนิกส์ที่่เชื่อถือได้ตามมาตรา 28 เมื่อใช้คำสั่งตรวจสอบลายมือชื่อด้วยโปรแกรมดูเอกสาร PDF จะปรากฎข้อมูลสำคัญดังจะกล่าวต่อไปนี้
			</p>
			<ol class="list-decimal list-outside ml-10 clear-left">
				<li>
					<img
						src="/art28-signature-list.png"
						alt="Signature list for Article 26 document"
						class="h-1/2 w-auto my-4 mx-[auto] shadow-md text-center"
					>
					มีรายการลงลายมือชื่อดิจิตอล โดยปรากฎชื่อข้าพเจ้าลงลายมือชื่อ
				</li>
				<li>
					<img
						src="/art28-certificate.png"
						alt="Certificate for Article 26 document"
						class="h-1/2 w-auto my-4 mx-[auto] shadow-md text-center"
					>
					ลายมือชื่อดิจิตอลจะต้องใช้ใบรับรองที่ออกให้ข้าพเจ้าโดยหน่วยงานที่ได้รับการยอมรับจาก Thailand National Root Certification Authority หรือหน่วยงานอื่น
				</li>
				<li>
					<img
						src="/art28-timestamp.png"
						alt="Timestamp for Article 26 document"
						class="h-1/2 w-auto my-4 mx-[auto] shadow-md text-center"
					>
					ลายมือชื่อดิจิตอลจะต้องประทับเวลาโดย Sectigo RSA Time Stamping Signer หรือหน่วยงานอื่น
				</li>
			</ol>
			<h2 class="h2 my-2 text-lg">คำขอบคุณ</h2>
			<p>
				ขอขอบคุณ <a
					href="https://www.facebook.com/dometel/"
					target="_blank"
					class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
				>คุณโดม เจริญยศ</a> ที่กรุณาอธิบายถึงขั้นตอนและความชอบธรรมของลายมือชื่ออิเล็กทรอนิกส์ตามมาตรา 26 จนเป็นแรงบันดาลใจให้ทำระบบนี้ในที่สุด<br>
				ขอขอบคุณ <a
					href="https://law.ru.ac.th/"
					target="_blank"
					class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
				>คณะนิติศาสตร์ มหาวิทยาลัยรามคำแหง</a> และ<q>กลุ่มทนายไก่ย่างสามสหาย</q> สำหรับความรู้ในทางกฎหมายที่เกี่ยวข้อง<br>
				ขอขอบคุณ <a
					href="https://ca.inet.co.th/inetca/"
					target="_blank"
					class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
				>บริษัท วัน ออเทน จำกัด </a> ที่ให้ความกรุณาให้คำปรึกษาและยอมออกใบรับรองสำหรับบุคคลให้ข้าพเจ้า<br>
				ขอขอบคุณเพื่อนร่วมวิชาชีพโปรแกรมเมอร์ผู้ไม่ประสงค์ออกนามหลายท่านที่ให้ความรู้และข้อแนะนำในการจัดทำระบบฯ ตามมาตรา 26
			</p>
		{:else if $drawerStore.id === 'certs'}
			<h1 class="h1 my-2 text-xl">รายการใบรับรอง</h1>
			{#await $drawerStore.meta.certs}
				<section class="card w-full">
					<div class="p-4 space-y-4 animate-pulse">
						<div class="placeholder" />
						<div class="grid grid-cols-4 gap-4">
							<div class="placeholder" />
							<div class="placeholder" />
							<div class="placeholder" />
							<div class="placeholder" />
						</div>
						<div class="placeholder" />
						<div class="placeholder" />
					</div>
				</section>
			{:then certRes}
				{#if ! certRes[0]}
					<aside class="alert variant-filled-error my-4">
						<!-- Icon -->
						<div><i class="fa-solid fa-circle-exclamation"></i></div>
						<!-- Message -->
						<div class="alert-message">
							<h3 class="h3">ขออภัย</h3>
							<p>เกิดปัญหาระหว่าการเรียกขอรายการใบรับรอง (&lt;<code>{certRes[1].err_cde}</code>&gt;)</p>
							<p><code>{certRes[1].err_desc}</code></p>
						</div>
					</aside>
				{:else}
					<!-- Responsive Container (recommended) -->
					<div class="table-container">
						<!-- Native Table Element -->
						<table class="table table-hover">
							<thead>
								<tr>
									<th>รหัส</th>
									<th>ชื่อ</th>
									<th>ผู้ออก</th>
									<th>รหัสใบรับรอง</th>
									<th>วันที่ออก</th>
									<th>รายการใบรับรอง</th>
								</tr>
							</thead>
							<tbody>
								{#each Object.entries(certRes[1]) as [certkey, cert]}
									<tr>
										<td><code>{certkey}</code></td>
										<td>{cert.name}</td>
										<td>{cert.authoriser_name}</td>
										<td>{cert.cert_request_id}</td>
										<td>{cert.cert_request_date}</td>
										<td>
											<ul class="list-disc list-outside mx-4 my-2">
												{#each Object.entries(cert.certificate) as [certType, certPayload]}
													<li><a
														href="data:application/pkix-cert;base64,{certPayload}"
														download="cert-{certkey}-{certType}.cer"
														class="underline underline-offset-2 decoration-sky-800 dark:decoration-sky-100"
													>
														{
															`ใบรับรอง${{
																'base': 'หลัก',
																'chain': 'สายลำดับ',
																'root': 'ต้นสาย',
															}[certType] ?? 'ทั่วไป'}`
														} <i class="fa-solid fa-link"></i>
													</a></li>
												{/each}
											</ul>

										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{:catch error}
				<aside class="alert variant-filled-error my-4">
					<!-- Icon -->
					<div><i class="fa-solid fa-circle-exclamation"></i></div>
					<!-- Message -->
					<div class="alert-message">
						<h3 class="h3">ขออภัย</h3>
						<p>เกิดปัญหาระหว่าการเรียกขอรายการใบรับรอง</p>
						<p><code>{error.message}</code></p>
					</div>
				</aside>
			{/await}
		{:else if $drawerStore.id === 'police-record'}
			<h1 class="h1 my-2 text-xl">ใบลงบันทึกประจำวัน</h1>
			<p>กำลังดำเนินการ</p>
		{/if}
	</div>
</Drawer>
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<h1 class="h1 text-xl uppercase drop-shadow-lg">ระบบตรวจสอบสิ่งพิมพ์ออกและเอกสารอิเล็กทรอนิกส์<br/>นายราชศักดิ์ รักษ์กำเนิด</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<button
					class="btn btn-sm variant-ghost-surface"
					on:click={() => { openDrawer('docs'); }}
				>
					คำแนะนำ
				</button>
				<button
					class="btn btn-sm variant-ghost-surface"
					on:click={() => { openDrawer('certs', { certs: fetchDocCerts() }); }}
				>
					ใบรับรอง
				</button>
				<button
					class="btn btn-sm variant-ghost-surface"
					on:click={() => { openDrawer('police-record'); }}
				>
					ใบลงบันทึกประจำวัน
				</button>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot />
	<!-- <svelte:fragment slot="pageFooter">Page Footer</svelte:fragment> -->
</AppShell>

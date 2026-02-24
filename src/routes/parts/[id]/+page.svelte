<script lang="ts">
	import type { PageData } from './$types';
	import { base } from '$app/paths';

	export let data: PageData;
	const { part } = data;
</script>

<svelte:head>
	<title>{part.name} - Primo Parts Garage</title>
</svelte:head>

<div class="container">
	<div class="header-bar">
		<a href="{base}/" class="logo-link">
			<img src="{base}/primo-logo.svg" alt="Primo Parts Garage" class="logo" />
		</a>
		<a href="{base}/" class="back-link">← Back to Inventory</a>
	</div>

	<div class="detail-card">
		<div class="detail-image">
			{#if part.image}
				<img src={base + part.image} alt={part.name} />
			{:else}
				<div class="no-image">
					<div class="no-image-text">
						<span class="primo-badge">PRIMO</span>
						<span class="no-img-label">NO IMAGE AVAILABLE</span>
						<span class="available-label">PART IN STOCK</span>
					</div>
				</div>
			{/if}
		</div>

		<div class="header">
			<h1>{part.name}</h1>
			<p class="price">${part.price}</p>
		</div>

		<div class="info-grid">
			<div class="info-item">
				<span class="label">Model:</span>
				<span class="value">{part.model}</span>
			</div>
			<div class="info-item">
				<span class="label">Year:</span>
				<span class="value">{part.year}</span>
			</div>
			<div class="info-item">
				<span class="label">Mileage:</span>
				<span class="value">{part.mileage.toLocaleString()} mi</span>
			</div>
			<div class="info-item">
				<span class="label">Category:</span>
				<span class="value">{part.category}</span>
			</div>
			<div class="info-item">
				<span class="label">Condition:</span>
				<span class="value condition-{part.condition.toLowerCase()}">{part.condition}</span>
			</div>
		</div>

		<div class="description-section">
			<h2>Description</h2>
			<p>{part.fullDescription}</p>
		</div>

		<div class="tags-section">
			<h3>Tags</h3>
			<div class="tags">
				{#each part.tags as tag}
					<a href="{base}/?tags={encodeURIComponent(tag)}" class="tag">{tag}</a>
				{/each}
			</div>
		</div>

		<div class="contact-section">
			<p>Interested in this part? Contact us for availability and shipping options.</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', Arial, sans-serif;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.header-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #333;
	}

	.logo-link {
		display: block;
		background: white;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		box-shadow: 0 2px 6px rgba(0,0,0,0.5);
	}

	.logo {
		height: 50px;
		width: auto;
		display: block;
		transition: transform 0.2s;
	}

	.logo-link:hover .logo {
		transform: scale(1.05);
	}

	.back-link {
		display: inline-block;
		color: #ff3333;
		text-decoration: none;
		font-weight: bold;
		text-shadow: 0 0 5px rgba(255,51,51,0.5);
		transition: all 0.2s;
	}

	.back-link:hover {
		color: #ff6666;
		text-shadow: 0 0 10px rgba(255,51,51,0.8);
	}

	.detail-card {
		background: linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
		border: 2px solid #333;
		overflow: hidden;
	}

	.detail-image {
		width: 100%;
		height: 400px;
		overflow: hidden;
		background: #000;
		position: relative;
	}

	.detail-image::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
		pointer-events: none;
	}

	.detail-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: 
			linear-gradient(135deg, #1a1a1a 25%, transparent 25%),
			linear-gradient(225deg, #1a1a1a 25%, transparent 25%),
			linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
			linear-gradient(315deg, #1a1a1a 25%, #0f0f0f 25%);
		background-position: 10px 0, 10px 0, 0 0, 0 0;
		background-size: 20px 20px;
		background-repeat: repeat;
	}

	.no-image-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-align: center;
	}

	.primo-badge {
		font-family: 'Impact', 'Arial Black', sans-serif;
		font-size: 3rem;
		color: #ff3333;
		text-shadow: 
			2px 2px 4px rgba(0,0,0,0.8),
			0 0 15px rgba(255,51,51,0.6);
		letter-spacing: 4px;
	}

	.no-img-label {
		font-family: 'Courier New', monospace;
		font-size: 1.2rem;
		color: #999;
		font-weight: bold;
		letter-spacing: 2px;
	}

	.available-label {
		font-family: 'Trebuchet MS', sans-serif;
		font-size: 0.9rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.header {
		border-bottom: 2px solid #444;
		padding: 2rem 2rem 1.5rem;
		margin-bottom: 1.5rem;
		position: relative;
	}

	.header::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 100px;
		height: 2px;
		background: linear-gradient(90deg, #cc0000, transparent);
	}

	h1 {
		margin: 0 0 0.5rem;
		color: #fff;
		font-size: 2rem;
		text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.price {
		font-size: 2rem;
		font-weight: bold;
		color: #ff3333;
		margin: 0;
		text-shadow: 
			0 0 10px rgba(255,51,51,0.8), 
			0 0 20px rgba(255,51,51,0.5),
			2px 2px 4px rgba(0,0,0,0.8);
		font-family: 'Impact', 'Arial Black', sans-serif;
		letter-spacing: 2px;
		animation: priceGlow 1.5s ease-in-out infinite alternate;
	}

	@keyframes priceGlow {
		from {
			text-shadow: 
				0 0 10px rgba(255,51,51,0.8), 
				0 0 20px rgba(255,51,51,0.5),
				2px 2px 4px rgba(0,0,0,0.8);
		}
		to {
			text-shadow: 
				0 0 15px rgba(255,51,51,1), 
				0 0 30px rgba(255,51,51,0.8),
				0 0 40px rgba(255,51,51,0.5),
				2px 2px 4px rgba(0,0,0,0.8);
		}
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin: 0 2rem 2rem;
		padding: 1rem;
		background: rgba(0,0,0,0.3);
		border-radius: 4px;
		border: 1px solid #444;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.85rem;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-weight: bold;
	}

	.value {
		font-size: 1.1rem;
		color: #e0e0e0;
		font-weight: 500;
	}

	.condition-excellent {
		color: #90ee90;
		text-shadow: 0 0 8px rgba(144,238,144,0.6);
	}

	.condition-good {
		color: #87ceeb;
		text-shadow: 0 0 8px rgba(135,206,235,0.6);
	}

	.condition-fair {
		color: #ffd700;
		text-shadow: 0 0 8px rgba(255,215,0,0.6);
	}

	.description-section {
		margin: 0 2rem 2rem;
	}

	h2 {
		margin: 0 0 1rem;
		color: #fff;
		font-size: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		border-left: 4px solid #cc0000;
		padding-left: 1rem;
		text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
	}

	.description-section p {
		line-height: 1.7;
		color: #b0b0b0;
		margin: 0;
		padding-left: 1.25rem;
	}

	.tags-section {
		margin: 0 2rem 2rem;
	}

	h3 {
		margin: 0 0 0.75rem;
		color: #fff;
		font-size: 1.2rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
		border-radius: 20px;
		font-size: 0.9rem;
		color: #ccc;
		border: 1px solid #555;
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3);
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 0.5px;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag:hover {
		background: linear-gradient(180deg, #cc0000 0%, #990000 100%);
		border-color: #ff3333;
		color: #fff;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(204,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
	}

	.contact-section {
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		padding: 1.5rem;
		margin: 0 2rem 2rem;
		border-radius: 4px;
		border-left: 4px solid #cc0000;
		border: 2px solid #444;
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
	}

	.contact-section p {
		margin: 0;
		color: #b0b0b0;
		font-style: italic;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem 0.5rem;
		}

		.header-bar {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.logo {
			height: 40px;
		}

		.detail-card {
			border-radius: 4px;
		}

		.detail-image {
			height: 250px;
		}

		.header {
			padding: 1.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.price {
			font-size: 1.75rem;
		}

		.info-grid,
		.description-section,
		.tags-section,
		.contact-section {
			margin-left: 1.5rem;
			margin-right: 1.5rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
